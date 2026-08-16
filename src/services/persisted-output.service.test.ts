import { jest } from "@jest/globals";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

describe("persisted-output.service", () => {
  let storageDir: string;
  let service: typeof import("./persisted-output.service.js");

  beforeEach(async () => {
    storageDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "persisted-output-test-"),
    );
    process.env.OUTPUT_STORAGE_DIR = storageDir;
    jest.resetModules();
    service = await import("./persisted-output.service.js");
  });

  afterEach(async () => {
    delete process.env.OUTPUT_STORAGE_DIR;
    await fs.rm(storageDir, { recursive: true, force: true });
  });

  it("creates a 24-character hex output id", () => {
    const outputId = service.createPersistedOutputId();
    expect(outputId).toMatch(/^[a-f0-9]{24}$/);
  });

  it("returns null when reading an output that was never saved", async () => {
    const result = await service.readPersistedOutput(
      "abcdefabcdefabcdefabcdef",
    );
    expect(result).toBeNull();
  });

  it("throws for an invalid output id", async () => {
    await expect(service.readPersistedOutput("not-valid")).rejects.toThrow(
      "Invalid persisted output ID.",
    );
  });

  it("saves and reads back a persisted output round-trip", async () => {
    const outputId = service.createPersistedOutputId();
    await service.savePersistedOutput(outputId, "replay.rrf", '{"a":1}');

    const result = await service.readPersistedOutput(outputId);

    expect(result).toEqual({
      outputId,
      replayFileName: "replay.rrf",
      outputRaw: '{"a":1}',
    });
  });

  it("deletes persisted artifacts", async () => {
    const outputId = service.createPersistedOutputId();
    await service.savePersistedOutput(outputId, "replay.rrf", '{"a":1}');

    await service.deletePersistedOutputArtifacts(outputId);

    const result = await service.readPersistedOutput(outputId);
    expect(result).toBeNull();
  });

  it("rethrows non-ENOENT errors when reading a persisted output", async () => {
    const outputId = service.createPersistedOutputId();
    // Create a directory where the output file is expected so readFile fails with EISDIR, not ENOENT.
    await fs.mkdir(path.join(storageDir, "outputs", `${outputId}.json`), {
      recursive: true,
    });
    await fs.mkdir(path.join(storageDir, "metadata", `${outputId}.json`), {
      recursive: true,
    });

    await expect(service.readPersistedOutput(outputId)).rejects.toMatchObject({
      code: "EISDIR",
    });
  });
});
