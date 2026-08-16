import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import type { parseReplayFile as parseReplayFileType } from "../services/parser.service.js";
import type {
  createPersistedOutputId as createPersistedOutputIdType,
  savePersistedOutput as savePersistedOutputType,
  readPersistedOutput as readPersistedOutputType,
  deletePersistedOutputArtifacts as deletePersistedOutputArtifactsType,
} from "../services/persisted-output.service.js";

const parseReplayFileMock = jest.fn<typeof parseReplayFileType>();
const createPersistedOutputIdMock = jest.fn<typeof createPersistedOutputIdType>(
  () => "abcdefabcdefabcdefabcdef",
);
const savePersistedOutputMock = jest.fn<typeof savePersistedOutputType>();
const readPersistedOutputMock = jest.fn<typeof readPersistedOutputType>();
const deletePersistedOutputArtifactsMock =
  jest.fn<typeof deletePersistedOutputArtifactsType>();

jest.unstable_mockModule("../services/parser.service.js", () => ({
  parseReplayFile: parseReplayFileMock,
}));

jest.unstable_mockModule("../services/persisted-output.service.js", () => ({
  createPersistedOutputId: createPersistedOutputIdMock,
  savePersistedOutput: savePersistedOutputMock,
  readPersistedOutput: readPersistedOutputMock,
  deletePersistedOutputArtifacts: deletePersistedOutputArtifactsMock,
}));

const { default: parserRouter } = await import("./parser.route.js");

const buildApp = () => {
  const app = express();
  app.use((_req, res, next) => {
    res.locals.requestId = "test-request-id";
    next();
  });
  app.use(parserRouter);
  return app;
};

describe("parserRouter", () => {
  describe("POST /parse", () => {
    it("rejects a request with no file", async () => {
      const response = await request(buildApp()).post("/parse");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Missing replay file in the 'replay' field.",
      );
    });

    it("rejects a file with the wrong extension", async () => {
      const response = await request(buildApp())
        .post("/parse")
        .attach("replay", Buffer.from("data"), "replay.txt");

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Only .rrf files are allowed.");
    });

    it("parses and persists a valid replay file", async () => {
      parseReplayFileMock.mockResolvedValue('{"replayVersion":"1"}');
      savePersistedOutputMock.mockResolvedValue(undefined);

      const response = await request(buildApp())
        .post("/parse")
        .attach("replay", Buffer.from("data"), "replay.rrf");

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        outputId: "abcdefabcdefabcdefabcdef",
        replayFileName: "replay.rrf",
        outputRaw: '{"replayVersion":"1"}',
      });
      expect(savePersistedOutputMock).toHaveBeenCalledWith(
        "abcdefabcdefabcdefabcdef",
        "replay.rrf",
        '{"replayVersion":"1"}',
      );
    });

    it("cleans up persisted artifacts and forwards the error when parsing fails", async () => {
      parseReplayFileMock.mockRejectedValue(new Error("boom"));

      const response = await request(buildApp())
        .post("/parse")
        .attach("replay", Buffer.from("data"), "replay.rrf");

      expect(response.status).toBe(500);
      expect(deletePersistedOutputArtifactsMock).toHaveBeenCalledWith(
        "abcdefabcdefabcdefabcdef",
      );
    });

    it("still responds with an error when cleanup itself fails", async () => {
      parseReplayFileMock.mockRejectedValue(new Error("boom"));
      deletePersistedOutputArtifactsMock.mockRejectedValueOnce(
        new Error("cleanup failed"),
      );

      const response = await request(buildApp())
        .post("/parse")
        .attach("replay", Buffer.from("data"), "replay.rrf");

      expect(response.status).toBe(500);
    });

    it("forwards non-Error rejections without setting an error message", async () => {
      parseReplayFileMock.mockRejectedValue("not an error instance");

      const response = await request(buildApp())
        .post("/parse")
        .attach("replay", Buffer.from("data"), "replay.rrf");

      expect(response.status).toBe(500);
    });
  });

  describe("GET /parse/:outputId", () => {
    it("rejects an invalid output id format", async () => {
      const response = await request(buildApp()).get("/parse/not-valid");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid persisted output ID format.");
    });

    it("returns 404 when no persisted output exists", async () => {
      readPersistedOutputMock.mockResolvedValue(null);

      const response = await request(buildApp()).get(
        "/parse/abcdefabcdefabcdefabcdef",
      );

      expect(response.status).toBe(404);
    });

    it("returns the persisted output when found", async () => {
      readPersistedOutputMock.mockResolvedValue({
        outputId: "abcdefabcdefabcdefabcdef",
        replayFileName: "replay.rrf",
        outputRaw: '{"replayVersion":"1"}',
      });

      const response = await request(buildApp()).get(
        "/parse/abcdefabcdefabcdefabcdef",
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        replayFileName: "replay.rrf",
        outputId: "abcdefabcdefabcdefabcdef",
        outputRaw: '{"replayVersion":"1"}',
      });
    });

    it("forwards the error when reading a persisted output throws", async () => {
      readPersistedOutputMock.mockRejectedValue(new Error("read failed"));

      const response = await request(buildApp()).get(
        "/parse/abcdefabcdefabcdefabcdef",
      );

      expect(response.status).toBe(500);
    });
  });
});
