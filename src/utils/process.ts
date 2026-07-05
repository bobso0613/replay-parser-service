import { spawn } from "node:child_process";

export type RunProcessOptions = {
  cwd?: string;
  wineBinary?: string;
};

export type RunProcessResult = {
  code: number | null;
  signal: NodeJS.Signals | null;
  stderr: string;
};

export const runProcess = (
  command: string,
  args: string[],
  options: RunProcessOptions = {},
): Promise<RunProcessResult> => {
  const shouldUseWine =
    process.platform !== "win32" && command.endsWith(".exe");
  const actualCommand = shouldUseWine
    ? (options.wineBinary ?? process.env.WINE_BIN ?? "wine")
    : command;
  const actualArgs = shouldUseWine ? [command, ...args] : args;

  return new Promise((resolve, reject) => {
    const child = spawn(actualCommand, actualArgs, {
      cwd: options.cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code, signal) => {
      resolve({
        code,
        signal,
        stderr,
      });
    });
  });
};
