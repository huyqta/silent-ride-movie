import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const assetsIgnorePath = join(outDir, ".assetsignore");

await mkdir(outDir, { recursive: true });
await writeFile(
  assetsIgnorePath,
  ["_worker.js", "_redirects", "_headers"].join("\n") + "\n",
  "utf8"
);
