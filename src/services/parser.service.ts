import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { runProcess } from "../utils/process.js";
import type { IReplayData } from "../types/replay-api.js";

const parserExecutable =
  process.env.PARSER_EXE ??
  path.join(process.cwd(), "src", "parser", "RagnarokReplayExample.exe");

const parseOutputJson = async (outputPath: string): Promise<IReplayData> => {
  const output = await fs.readFile(outputPath, "utf8");
  return JSON.parse(output) as IReplayData;
};

export const parseReplayFile = async (
  uploadedFilePath: string,
): Promise<IReplayData> => {
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
      [inputFileName, outputFileName],
      { cwd: jobDir },
    );

    if (processResult.code !== 0) {
      const details = processResult.stderr.trim();
      throw new Error(
        `Parser process failed${processResult.code !== null ? ` with exit code ${processResult.code}` : ""}${processResult.signal ? ` (signal ${processResult.signal})` : ""}${details ? `: ${details}` : ""}`,
      );
    }

    return await parseOutputJson(outputPath);
  } finally {
    await fs.rm(jobDir, { recursive: true, force: true });
    await fs.rm(uploadedFilePath, { force: true });
  }
};
