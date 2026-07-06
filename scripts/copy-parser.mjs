import fs from "node:fs/promises";
import path from "node:path";

const sourceDir = path.join(process.cwd(), "src", "parser");
const destinationDir = path.join(process.cwd(), "dist", "parser");

const copyParserAssets = async () => {
  try {
    await fs.access(sourceDir);
  } catch {
    console.warn(`Parser source directory not found: ${sourceDir}`);
    return;
  }

  await fs.mkdir(destinationDir, { recursive: true });
  await fs.cp(sourceDir, destinationDir, { recursive: true, force: true });

  console.log(`Copied parser assets to ${destinationDir}`);
};

void copyParserAssets();
