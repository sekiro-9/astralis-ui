/* ==========================================================================
   ASTRALIS — SITE SEARCH INDEX
   --------------------------------------------------------------------------
   Runs after `next build` and writes a Pagefind index to public/pagefind/,
   which ships with the deploy as static files. The header's search dialog
   loads it on first open; there is no search server.

   Docs pages are read from the prerendered HTML in .next/server/app, and
   Pagefind only indexes what sits inside `data-pagefind-body` (the docs
   article), so the header, sidebar and TOC never pollute results. Each file
   is handed over with its route as the URL, because Next serves
   `docs/theming.html` at `/docs/theming`, not at the file's own path.

   Block pages are indexed from the registry instead of their HTML: the
   detail page is mostly a live preview and source code, while the registry
   holds the words a reader searches for (name, description, tags).
   ========================================================================== */

import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import * as pagefind from "pagefind";

const DOCS = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = join(DOCS, ".next", "server", "app");
const OUT = join(DOCS, "public", "pagefind");
// Workspace sibling by path, as in gen-block-registry.mjs.
const CATALOGUE = join(DOCS, "..", "astralis-blocks", "registry", "index.json");

const die = (message) => {
  console.error(`[astralis] search index: ${message}`);
  process.exit(1);
};

if (!existsSync(join(APP, "docs.html"))) {
  die("no prerendered docs in .next/server/app — run `next build` first");
}

/** `docs/components/button.html` -> `/docs/components/button`. */
const routeOf = (file) =>
  `/${relative(APP, file)
    .replace(/\\/g, "/")
    .replace(/\.html$/, "")}`;

const docsPages = [
  join(APP, "docs.html"),
  ...readdirSync(join(APP, "docs"), { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => join(entry.parentPath, entry.name)),
].sort();

const { index, errors: createErrors } = await pagefind.createIndex({ forceLanguage: "en" });
if (!index) die(createErrors.join("\n"));

const problems = [];

for (const file of docsPages) {
  const content = readFileSync(file, "utf8");
  // Without the marker Pagefind indexes the whole <body>, header and sidebar
  // included, and silently drops the page once any other page has it.
  if (!content.includes("data-pagefind-body")) {
    problems.push(`${routeOf(file)} has no data-pagefind-body`);
    continue;
  }
  const { errors } = await index.addHTMLFile({ url: routeOf(file), content });
  problems.push(...errors);
}

const { blocks } = JSON.parse(readFileSync(CATALOGUE, "utf8"));
for (const block of blocks) {
  const { errors } = await index.addCustomRecord({
    url: `/blocks/${block.id}`,
    language: "en",
    meta: { title: block.name },
    content: [
      `${block.name}.`,
      block.description,
      `Tags: ${block.tags.join(", ")}.`,
      `Built with ${block.uses.join(", ")}.`,
      `Install with npx astralis-cli add ${block.id}.`,
    ].join(" "),
  });
  problems.push(...errors);
}

if (problems.length) die(problems.join("\n"));

rmSync(OUT, { recursive: true, force: true });
const { errors: writeErrors } = await index.writeFiles({ outputPath: OUT });
if (writeErrors.length) die(writeErrors.join("\n"));
await pagefind.close();

console.log(
  `[astralis] search index: ${docsPages.length} docs page(s) + ${blocks.length} block(s) -> public/pagefind`,
);
