import { jest } from "@jest/globals";
import request from "supertest";
import type { logAccessEntry as logAccessEntryType } from "../src/utils/request-logger.js";
import type { parseReplayFile as parseReplayFileType } from "../src/services/parser.service.js";
import type {
  createPersistedOutputId as createPersistedOutputIdType,
  savePersistedOutput as savePersistedOutputType,
  readPersistedOutput as readPersistedOutputType,
  deletePersistedOutputArtifacts as deletePersistedOutputArtifactsType,
} from "../src/services/persisted-output.service.js";

const logAccessEntryMock = jest.fn<typeof logAccessEntryType>();
logAccessEntryMock.mockResolvedValue(undefined);

jest.unstable_mockModule("../src/utils/request-logger.js", () => ({
  logAccessEntry: logAccessEntryMock,
}));

const parseReplayFileMock = jest.fn<typeof parseReplayFileType>();

jest.unstable_mockModule("../src/services/parser.service.js", () => ({
  parseReplayFile: parseReplayFileMock,
}));

const readPersistedOutputMock = jest.fn<typeof readPersistedOutputType>();
readPersistedOutputMock.mockResolvedValue(null);

jest.unstable_mockModule("../src/services/persisted-output.service.js", () => ({
  createPersistedOutputId: jest.fn<typeof createPersistedOutputIdType>(
    () => "abcdefabcdefabcdefabcdef",
  ),
  savePersistedOutput: jest.fn<typeof savePersistedOutputType>(),
  readPersistedOutput: readPersistedOutputMock,
  deletePersistedOutputArtifacts:
    jest.fn<typeof deletePersistedOutputArtifactsType>(),
}));

const { app } = await import("../src/app.js");

describe("app", () => {
  it("sets an x-request-id header on every response", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.headers["x-request-id"]).toBeDefined();
  });

  it("returns 404 with a JSON error for unknown routes", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Route not found.");
  });

  it("serves the generated OpenAPI document as JSON", async () => {
    const response = await request(app).get("/api-docs.json");

    expect(response.status).toBe(200);
    expect(response.body.info.title).toBe("Replay Parser Service API");
  });

  it("serves the Swagger UI at /api-docs", async () => {
    const response = await request(app).get("/api-docs/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("swagger-ui");
  });

  it("allows the configured CORS origin", async () => {
    const response = await request(app)
      .get("/api-docs.json")
      .set("Origin", "https://localhost:8443");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://localhost:8443",
    );
  });

  it("returns a 500 error response when a route handler throws", async () => {
    parseReplayFileMock.mockRejectedValue(new Error("parse failed"));

    const response = await request(app)
      .post("/parse")
      .attach("replay", Buffer.from("data"), "replay.rrf");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("parse failed");
  });

  it("logs but does not fail the response when access logging rejects", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    logAccessEntryMock.mockRejectedValueOnce(new Error("log write failed"));

    const response = await request(app).get("/unknown-route");

    expect(response.status).toBe(404);
    await new Promise((resolve) => setImmediate(resolve));
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to write access log",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
