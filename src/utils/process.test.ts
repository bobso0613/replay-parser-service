import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import type { spawn as spawnType } from "node:child_process";

const spawnMock = jest.fn<typeof spawnType>();

jest.unstable_mockModule("node:child_process", () => ({
  spawn: spawnMock,
}));

const { runProcess } = await import("./process.js");

class FakeChildProcess extends EventEmitter {
  public stderr = new EventEmitter();
}

const createFakeChild = (): FakeChildProcess => new FakeChildProcess();

describe("runProcess", () => {
  const originalPlatform = process.platform;
  const originalMonoBin = process.env.MONO_BIN;

  afterEach(() => {
    Object.defineProperty(process, "platform", { value: originalPlatform });
    if (originalMonoBin === undefined) {
      delete process.env.MONO_BIN;
    } else {
      process.env.MONO_BIN = originalMonoBin;
    }
  });

  it("runs the command directly on win32 even for .exe files", async () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    const fakeChild = createFakeChild();
    spawnMock.mockReturnValue(fakeChild as never);

    const resultPromise = runProcess("tool.exe", ["a", "b"], { cwd: "/job" });
    fakeChild.emit("close", 0, null);
    const result = await resultPromise;

    expect(spawnMock).toHaveBeenCalledWith(
      "tool.exe",
      ["a", "b"],
      expect.objectContaining({ cwd: "/job" }),
    );
    expect(result).toEqual({ code: 0, signal: null, stderr: "" });
  });

  it("runs non-.exe commands directly even on non-win32 platforms", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    const fakeChild = createFakeChild();
    spawnMock.mockReturnValue(fakeChild as never);

    const resultPromise = runProcess("tool", ["a"]);
    fakeChild.emit("close", 0, null);
    await resultPromise;

    expect(spawnMock).toHaveBeenCalledWith("tool", ["a"], expect.anything());
  });

  it("wraps .exe commands with mono on non-win32 platforms", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    const fakeChild = createFakeChild();
    spawnMock.mockReturnValue(fakeChild as never);

    const resultPromise = runProcess("tool.exe", ["a"], {
      monoBinary: "custom-mono",
    });
    fakeChild.emit("close", 0, null);
    await resultPromise;

    expect(spawnMock).toHaveBeenCalledWith(
      "custom-mono",
      ["tool.exe", "a"],
      expect.anything(),
    );
  });

  it("falls back to the MONO_BIN env var when no monoBinary option is given", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    process.env.MONO_BIN = "env-mono";
    const fakeChild = createFakeChild();
    spawnMock.mockReturnValue(fakeChild as never);

    const resultPromise = runProcess("tool.exe", ["a"]);
    fakeChild.emit("close", 0, null);
    await resultPromise;

    expect(spawnMock).toHaveBeenCalledWith(
      "env-mono",
      ["tool.exe", "a"],
      expect.anything(),
    );
  });

  it("defaults to the mono binary when no option or env var is set", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    delete process.env.MONO_BIN;
    const fakeChild = createFakeChild();
    spawnMock.mockReturnValue(fakeChild as never);

    const resultPromise = runProcess("tool.exe", ["a"]);
    fakeChild.emit("close", 0, null);
    await resultPromise;

    expect(spawnMock).toHaveBeenCalledWith(
      "mono",
      ["tool.exe", "a"],
      expect.anything(),
    );
  });

  it("collects stderr and resolves with a non-zero exit code", async () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    const fakeChild = createFakeChild();
    spawnMock.mockReturnValue(fakeChild as never);

    const resultPromise = runProcess("tool.exe", []);
    fakeChild.stderr.emit("data", Buffer.from("uh oh"));
    fakeChild.emit("close", 1, null);

    await expect(resultPromise).resolves.toEqual({
      code: 1,
      signal: null,
      stderr: "uh oh",
    });
  });

  it("rejects when the child process emits an error", async () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    const fakeChild = createFakeChild();
    spawnMock.mockReturnValue(fakeChild as never);

    const resultPromise = runProcess("tool.exe", []);
    const spawnError = new Error("spawn failed");
    fakeChild.emit("error", spawnError);

    await expect(resultPromise).rejects.toThrow("spawn failed");
  });
});
