/* ==========================================================================
   ASTRALIS: SITE SEARCH INDEX
   --------------------------------------------------------------------------
   Writes a Pagefind index to public/pagefind/, which ships as static files.
   The header's search dialog loads it on first open; there is no search
   server.

   Pages are indexed from their source, through the same Markdown that
   llms.txt serves (src/lib/docs-markdown.ts), not from built HTML. So the
   index needs no `next build` and search works under `next dev` too. Each
   page becomes a small HTML document whose headings carry the ids the site
   gives them, so a result can deep-link to the section that matched.

   Blocks are indexed from the registry: the words a reader searches for
   (name, description, tags) live there, not in the live preview.
   ========================================================================== */

import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import * as pagefind from "pagefind";

const DOCS = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(DOCS, "public", "pagefind");
// Workspace sibling by path, as in gen-block-registry.mjs.
const CATALOGUE = join(DOCS, "..", "astralis-blocks", "registry", "index.json");

const die = (message) => {
  console.error(`[astralis] search index: ${message}`);
  process.exit(1);
};

/**
 * docs-markdown.ts is TypeScript with "@/" paths; esbuild resolves both. The
 * bundle sits inside this package so its external imports still resolve.
 */
async function loadDocsMarkdown() {
  const cache = join(DOCS, "node_modules", ".cache");
  mkdirSync(cache, { recursive: true });
  const dir = mkdtempSync(join(cache, "astralis-search-"));
  const outfile = join(dir, "docs-markdown.mjs");
  await build({
    entryPoints: [join(DOCS, "src", "lib", "docs-markdown.ts")],
    absWorkingDir: DOCS,
    tsconfig: join(DOCS, "tsconfig.json"),
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    outfile,
    logLevel: "error",
  });
  try {
    return await import(pathToFileURL(outfile).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Markdown inline syntax and JSX tags down to the words a reader sees. */
const plain = (text) =>
  text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\\([|*_`])/g, "$1")
    .trim();

/** rehype-slug's ids (github-slugger), so deep links land on the heading. */
function slugger() {
  const seen = new Map();
  return (text) => {
    const base = text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
      .replace(/ /g, "-");
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/**
 * A page's Markdown as the minimal HTML Pagefind needs: headings and prose.
 * Code examples and component tags stay out, so an excerpt is always words a
 * reader can scan, never a stray `/>`.
 */
function toHtml(title, markdown) {
  const prose = markdown
    .replace(/^```[\s\S]*?^```$/gm, "")
    .replace(/<[A-Z][^>]*?\/>/gs, "")
    .replace(/<\/?[A-Z][^>]*>/gs, "");
  const slug = slugger();
  const html = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length) html.push(`<p>${escape(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  for (const line of prose.split("\n")) {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flush();
      const text = plain(heading[2]);
      const level = heading[1].length;
      html.push(`<h${level} id="${slug(text)}">${escape(text)}</h${level}>`);
    } else if (/^\|?\s*:?-{3,}/.test(line)) {
      continue; // a table's separator row
    } else if (line.trim() === "") {
      flush();
    } else {
      paragraph.push(plain(line.replace(/\|/g, " ")));
    }
  }
  flush();
  return `<html lang="en"><head><title>${escape(title)}</title></head><body data-pagefind-body>${html.join("")}</body></html>`;
}

const docs = await loadDocsMarkdown();
const pages = [
  { url: "/docs", title: "Introduction", markdown: docs.introductionAsMarkdown({ demos: false }) },
  ...docs.listDocs().map((entry) => ({
    url: entry.kind === "component" ? `/docs/components/${entry.slug}` : `/docs/${entry.slug}`,
    title: entry.title,
    markdown: docs.docAsMarkdown(entry.slug, { demos: false }),
  })),
];

const { index, errors: createErrors } = await pagefind.createIndex({ forceLanguage: "en" });
if (!index) die(createErrors.join("\n"));

const problems = [];
for (const page of pages) {
  if (!page.markdown) {
    problems.push(`${page.url} has no page source`);
    continue;
  }
  const { errors } = await index.addHTMLFile({ url: page.url, content: toHtml(page.title, page.markdown) });
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

console.log(`[astralis] search index: ${pages.length} docs page(s) + ${blocks.length} block(s) -> public/pagefind`);
