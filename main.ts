// SPDX-License-Identifier: MIT
//
// gta6-meme-x-01 entry: the post is the entry. This program copies POST.json,
// the record naming the X post that carries the meme, from the repository
// root to the output directory. It uses only the Node.js standard library
// and touches no network.
//
// Run it locally:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const source = join(botDir, "POST.json");
if (!existsSync(source)) {
  console.error(`POST.json not found in ${botDir}`);
  process.exit(1);
}

let post: unknown;
try {
  post = JSON.parse(readFileSync(source, "utf8"));
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}

const url = (post as { url?: unknown }).url;
if (
  typeof url !== "string" ||
  !/^https:\/\/(x\.com|twitter\.com)\/\S+\/status\/\d+$/.test(url)
) {
  console.error(
    "POST.json must name a post URL like https://x.com/<handle>/status/<id>",
  );
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, join(outDir, "POST.json"));
console.log(`post: ${url}`);
