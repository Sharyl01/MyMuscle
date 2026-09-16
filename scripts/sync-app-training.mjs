import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const app = path.resolve(root, process.env.MYMUSCLE_APP_SOURCE || "../Fitnessapp28-11-2025");
const target = path.join(root, "src/lib/app-training");
const files = ["lib/training/constants.ts", "lib/training/utils.ts", "lib/training/loadSpectrum.ts", "constants/muscleStatusColors.ts", "lib/bodyModel/maleModel.ts"];
const manifest = {};
for (const file of files) {
  const source = await readFile(path.join(app, file));
  manifest[file] = createHash("sha256").update(source).digest("hex");
  if (process.argv.includes("--check")) {
    const copy = await readFile(path.join(target, file));
    if (!source.equals(copy)) throw new Error(`App training source has changed: ${file}. Run node scripts/sync-app-training.mjs.`);
  } else {
    await mkdir(path.dirname(path.join(target, file)), { recursive: true });
    await writeFile(path.join(target, file), source);
  }
}
if (!process.argv.includes("--check")) await writeFile(path.join(target, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`${files.length} app training modules ${process.argv.includes("--check") ? "verified byte for byte" : "synced without changes"}.`);
