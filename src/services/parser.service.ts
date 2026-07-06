import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { runProcess } from "../utils/process.js";

const parserExecutable =
  process.env.PARSER_EXE ??
  path.join(process.cwd(), "src", "parser", "RagnarokReplayExample.exe");

const readOutputJsonRaw = async (outputPath: string): Promise<string> => {
  return await fs.readFile(outputPath, "utf8");
};

export const parseReplayFile = async (
  uploadedFilePath: string,
): Promise<string> => {
  const jobDir = path.join(os.tmpdir(), crypto.randomUUID());
  const inputFileName = "input.rrf";
  const outputFileName = "output.json";
  const inputPath = path.join(jobDir, inputFileName);
  const outputPath = path.join(jobDir, outputFileName);

  await fs.mkdir(jobDir);

  try {
    await fs.rename(uploadedFilePath, inputPath);

    const processResult = await runProcess(
      parserExecutable,
      [inputFileName, outputFileName, "--minify-json"],
      { cwd: jobDir },
    );

    if (processResult.code !== 0) {
      const details = processResult.stderr.trim();
      throw new Error(
        `Parser process failed${processResult.code !== null ? ` with exit code ${processResult.code}` : ""}${processResult.signal ? ` (signal ${processResult.signal})` : ""}${details ? `: ${details}` : ""}`,
      );
    }

    return await readOutputJsonRaw(outputPath);
  } finally {
    await fs.rm(jobDir, { recursive: true, force: true });
    await fs.rm(uploadedFilePath, { force: true });
  }
};
