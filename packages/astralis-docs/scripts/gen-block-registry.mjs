/* ==========================================================================
   ASTRALIS — PUBLIC BLOCK REGISTRY
   --------------------------------------------------------------------------
   `astralis add <id>` has to get a block's source from somewhere. The registry
   JSON already exists in astralis-blocks, but it is a build artifact inside a
   workspace package — nothing outside this repo can read it.

   This copies it into the docs site's public/ directory, so the deployed docs
   ARE the registry:

     /r/index.json      catalogue — every block, no source. `astralis add --list`
     /r/{id}.json       one block: metadata + the full text of its files

   Static files, so they ride the docs deploy and are cached by the CDN like
   any other asset. No route handler, no server, nothing to keep running.
   Publishing astralis-blocks to npm would be a second, redundant channel.

   Serving over HTTP rather than bundling into the CLI keeps the two on
   separate clocks: adding a block is a docs deploy, not a CLI release.
   ========================================================================== */

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, "..");
// Workspace siblings by path: neither package exports its package.json, so
// require.resolve cannot reach into them.
const BLOCKS = join(DOCS, "..", "astralis-blocks");
const SOURCE = join(BLOCKS, "registry", "blocks");
const OUT = join(DOCS, "public", "r");

/** Bumped only when the item shape changes in a way a CLI must react to. */
const REGISTRY_VERSION = 1;

const { blocks: catalogue } = JSON.parse(
  readFileSync(join(BLOCKS, "registry", "index.json"), "utf8"),
);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let bytes = 0;
const write = (name, data) => {
  const json = `${JSON.stringify(data, null, 2)}\n`;
  writeFileSync(join(OUT, name), json);
  bytes += Buffer.byteLength(json);
};

/* --- one file per block, source included ------------------------------- */
const ids = readdirSync(SOURCE)
  .filter((name) => name.endsWith(".json"))
  .sort();

for (const file of ids) {
  const item = JSON.parse(readFileSync(join(SOURCE, file), "utf8"));
  write(file, { registryVersion: REGISTRY_VERSION, ...item });
}

/* --- catalogue, no source ----------------------------------------------- */
write("index.json", {
  registryVersion: REGISTRY_VERSION,
  count: catalogue.length,
  blocks: catalogue,
});

console.log(
  `[astralis] block registry: ${ids.length} item(s) + index, ` +
    `${(bytes / 1024).toFixed(0)} KB -> public/r`,
);
