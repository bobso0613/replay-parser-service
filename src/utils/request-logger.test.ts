import { jest } from "@jest/globals";

const mkdirMock = jest.fn<(...args: unknown[]) => Promise<void>>();
const appendFileMock = jest.fn<(...args: unknown[]) => Promise<void>>();

mkdirMock.mockResolvedValue(undefined);
appendFileMock.mockResolvedValue(undefined);

jest.unstable_mockModule("node:fs/promises", () => ({
  default: {
    mkdir: mkdirMock,
    appendFile: appendFileMock,
  },
}));

const { logAccessEntry } = await import("./request-logger.js");

describe("logAccessEntry", () => {
  it("creates the log directory and appends a sanitized log line", async () => {
    await logAccessEntry({
      requestId: "req-1",
      ip: "127.0.0.1",
      clientIp: "10.0.0.1",
      timestamp: "2026-08-16T00:00:00.000Z",
      route: "GET /parse/abc",
      fileName: "replay.rrf",
      outcome: "success",
      errorMessage: "N/A",
    });

    expect(mkdirMock).toHaveBeenCalledWith(expect.stringContaining("logs"), {
      recursive: true,
    });
    expect(appendFileMock).toHaveBeenCalledTimes(1);
    const [, logLine] = appendFileMock.mock.calls[0];
    expect(logLine).toContain("requestId=req-1");
    expect(logLine).toContain("outcome=success");
    expect(logLine).toContain("error=N/A");
  });

  it("strips newlines and pipe characters from log values", async () => {
    await logAccessEntry({
      requestId: "req-2",
      ip: "127.0.0.1",
      clientIp: "N/A",
      timestamp: "2026-08-16T00:00:00.000Z",
      route: "GET /parse/abc",
      fileName: "evil\nname|withpipe",
      outcome: "fail",
      errorMessage: "line1\r\nline2",
    });

    const [, logLine] = appendFileMock.mock.calls[0];
    const logLineBody = (logLine as string).replace(/\n$/, "");
    expect(logLineBody).not.toMatch(/[\r\n]/);
    expect(logLineBody).toContain("filename=evil name withpipe");
    expect(logLineBody).toContain("error=line1  line2");
  });
});
