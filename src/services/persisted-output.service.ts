import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const outputStorageDirectory = process.env.OUTPUT_STORAGE_DIR
  ? path.resolve(process.env.OUTPUT_STORAGE_DIR)
  : path.join(process.cwd(), "persisted-output");
const outputsDirectory = path.join(outputStorageDirectory, "outputs");
const metadataDirectory = path.join(outputStorageDirectory, "metadata");

const outputIdPattern = /^[a-f0-9]{24}$/;

const isValidOutputId = (outputId: string): boolean => {
  return outputIdPattern.test(outputId);
};

const assertValidOutputId = (outputId: string): void => {
  if (!isValidOutputId(outputId)) {
    throw new Error("Invalid persisted output ID.");
  }
};

const getPersistedOutputPath = (outputId: string): string => {
  assertValidOutputId(outputId);
  return path.join(outputsDirectory, `${outputId}.json`);
};

const getPersistedMetadataPath = (outputId: string): string => {
  assertValidOutputId(outputId);
  return path.join(metadataDirectory, `${outputId}.json`);
};

export type PersistedOutputData = {
  outputId: string;
  replayFileName: string;
  outputRaw: string;
};

type PersistedOutputMetadata = {
  outputId: string;
  replayFileName: string;
  createdAt: string;
};

export const createPersistedOutputId = (): string => {
  return crypto.randomBytes(12).toString("hex");
};

export const savePersistedOutput = async (
  outputId: string,
  replayFileName: string,
  rawJson: string,
): Promise<void> => {
  const outputPath = getPersistedOutputPath(outputId);
  const metadataPath = getPersistedMetadataPath(outputId);

  const metadata: PersistedOutputMetadata = {
    outputId,
    replayFileName,
    createdAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  await fs.writeFile(outputPath, rawJson, "utf8");
  await fs.writeFile(metadataPath, JSON.stringify(metadata), "utf8");
};

export const readPersistedOutput = async (
  outputId: string,
): Promise<PersistedOutputData | null> => {
  const outputPath = getPersistedOutputPath(outputId);
  const metadataPath = getPersistedMetadataPath(outputId);

  try {
    const [outputRaw, metadataRaw] = await Promise.all([
      fs.readFile(outputPath, "utf8"),
      fs.readFile(metadataPath, "utf8"),
    ]);
    const metadata = JSON.parse(metadataRaw) as PersistedOutputMetadata;

    return {
      outputId,
      replayFileName: metadata.replayFileName,
      outputRaw,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
};

export const deletePersistedOutputArtifacts = async (
  outputId: string,
): Promise<void> => {
  const outputPath = getPersistedOutputPath(outputId);
  const metadataPath = getPersistedMetadataPath(outputId);

  await Promise.all([
    fs.rm(outputPath, { force: true }),
    fs.rm(metadataPath, { force: true }),
  ]);
};
