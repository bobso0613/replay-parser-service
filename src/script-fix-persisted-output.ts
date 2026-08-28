import fs from "node:fs/promises";
import path from "node:path";
import { enrichOutput, preloadDatabases } from "./services/database.service.js";

const outputStorageDirectory = process.env.OUTPUT_STORAGE_DIR
  ? path.resolve(process.env.OUTPUT_STORAGE_DIR)
  : path.join(process.cwd(), "persisted-output");
const outputsDirectory = path.join(outputStorageDirectory, "outputs");

const enrichPersistedOutputs = async (): Promise<void> => {
  await preloadDatabases();

  const entries = await fs.readdir(outputsDirectory, { withFileTypes: true });
  const outputFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);
  const enrichedOutputs = await Promise.all(
    outputFiles.map(async (fileName) => {
      const filePath = path.join(outputsDirectory, fileName);
      const contents = await fs.readFile(filePath, "utf8");
      const output = enrichOutput(JSON.parse(contents));
      return { filePath, contents: JSON.stringify(output) };
    }),
  );

  await Promise.all(
    enrichedOutputs.map(({ filePath, contents }) =>
      fs.writeFile(filePath, contents, "utf8"),
    ),
  );

  console.log(`Enriched ${outputFiles.length} persisted output file(s).`);
};

void enrichPersistedOutputs().catch((error: unknown) => {
  console.error("Failed to enrich persisted outputs", error);
  process.exitCode = 1;
});
