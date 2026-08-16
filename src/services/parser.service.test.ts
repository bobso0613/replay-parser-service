import { jest } from "@jest/globals";
import type fsPromises from "node:fs/promises";
import type { runProcess as runProcessType } from "../utils/process.js";

const mkdirMock = jest.fn<(...args: unknown[]) => Promise<void>>();
const renameMock = jest.fn<(...args: unknown[]) => Promise<void>>();
const rmMock = jest.fn<(...args: unknown[]) => Promise<void>>();
const readFileMock = jest.fn<typeof fsPromises.readFile>();
const runProcessMock = jest.fn<typeof runProcessType>();

mkdirMock.mockResolvedValue(undefined);
renameMock.mockResolvedValue(undefined);
rmMock.mockResolvedValue(undefined);

jest.unstable_mockModule("node:fs/promises", () => ({
  default: {
    mkdir: mkdirMock,
    rename: renameMock,
    rm: rmMock,
    readFile: readFileMock,
  },
}));

jest.unstable_mockModule("../utils/process.js", () => ({
  runProcess: runProcessMock,
}));

const { parseReplayFile } = await import("./parser.service.js");

describe("parseReplayFile", () => {
  it("returns the parsed output JSON on success and cleans up the job dir", async () => {
    runProcessMock.mockResolvedValue({ code: 0, signal: null, stderr: "" });
    readFileMock.mockResolvedValue('{"replayVersion":"1"}');

    const result = await parseReplayFile("/tmp/uploaded-file");

    expect(result).toBe('{"replayVersion":"1"}');
    expect(renameMock).toHaveBeenCalledWith(
      "/tmp/uploaded-file",
      expect.stringContaining("input.rrf"),
    );
    expect(rmMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ recursive: true, force: true }),
    );
    expect(rmMock).toHaveBeenCalledWith(
      "/tmp/uploaded-file",
      expect.objectContaining({ force: true }),
    );
  });

  it("throws with process details and still cleans up when the parser exits non-zero", async () => {
    runProcessMock.mockResolvedValue({
      code: 2,
      signal: null,
      stderr: "bad replay",
    });

    await expect(parseReplayFile("/tmp/uploaded-file")).rejects.toThrow(
      "Parser process failed with exit code 2: bad replay",
    );

    expect(rmMock).toHaveBeenCalledWith(
      "/tmp/uploaded-file",
      expect.objectContaining({ force: true }),
    );
  });

  it("includes the signal in the error message when the process was killed", async () => {
    runProcessMock.mockResolvedValue({
      code: null,
      signal: "SIGKILL",
      stderr: "",
    });

    await expect(parseReplayFile("/tmp/uploaded-file")).rejects.toThrow(
      "Parser process failed (signal SIGKILL)",
    );
  });

  it("omits exit code, signal and details when none are present", async () => {
    runProcessMock.mockResolvedValue({
      code: null,
      signal: null,
      stderr: "   ",
    });

    await expect(parseReplayFile("/tmp/uploaded-file")).rejects.toThrow(
      "Parser process failed",
    );
  });
});
