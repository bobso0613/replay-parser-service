import fs from "node:fs/promises";
import path from "node:path";

const sourceDir = path.join(process.cwd(), "src", "parser");
const destinationDir = path.join(process.cwd(), "dist", "parser");

let sourceExists = true;
try {
  await fs.access(sourceDir);
} catch {
  sourceExists = false;
}

if (!sourceExists) {
  console.warn(`Parser source directory not found: ${sourceDir}`);
} else {
  await fs.mkdir(destinationDir, { recursive: true });
  await fs.cp(sourceDir, destinationDir, { recursive: true, force: true });

  console.log(`Copied parser assets to ${destinationDir}`);
}
