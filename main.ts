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
const dest = join(outDir, "POST.json");
copyFileSync(source, dest);

// Verify the copy round-trips: re-read what we wrote and confirm it still
// parses and names the same post. A partial write must fail loudly instead
// of leaving a corrupt POST.json in the output directory.
const copied = JSON.parse(readFileSync(dest, "utf8")) as { url?: unknown };
if (copied.url !== url) {
  console.error("POST.json copy does not match the source; refusing to continue");
  process.exit(1);
}
console.log(`post: ${url}`);
