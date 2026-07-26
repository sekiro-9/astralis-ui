/* ==========================================================================
   ASTRALIS — BLOCK REGISTRY BUILDER
   --------------------------------------------------------------------------
   Blocks ship as SOURCE: the CLI writes the files into a consumer's project,
   so the registry is a catalogue of text, not a bundle of components.

   This script walks src/{category}/{family}/{id}/ — e.g. hero/hero-split/
   hero-split-01 — validates each block
   against the authoring rules, and emits three artifacts:

     registry/index.json          catalogue only (no source) — docs list, CLI --list
     registry/blocks/{id}.json    metadata + file contents  — CLI `add`
     src/blocks.generated.ts      live component map        — docs previews, Studio

   Everything derivable from source (file list, exported component, which
   library components a block composes) is derived here, so meta.ts can never
   drift from what the block actually does. Output is deterministic; run with
   --check to fail when the committed artifacts are stale.
   ========================================================================== */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { transformSync } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const REGISTRY = join(ROOT, "registry");
const CHECK = process.argv.includes("--check");

// Keep in step with BLOCK_CATEGORIES in src/registry.ts.
const CATEGORIES = [
  "hero",
  "features",
  "pricing",
  "testimonials",
  "faq",
  "cta",
  "stats",
  "logos",
  "team",
  "contact",
  "navbar",
  "footer",
  "auth",
  "dashboard",
  "content",
];

const errors = [];
const fail = (id, message) => errors.push(`  ${id}: ${message}`);

/* -------------------------------------------------------------------------- */
/* Source derivation                                                          */
/* -------------------------------------------------------------------------- */

/** Evaluates a `meta.ts` by stripping its types — it must have no value imports. */
function loadMeta(file) {
  const { code } = transformSync(readFileSync(file, "utf8"), {
    loader: "ts",
    format: "esm",
    // Type-only imports are erased; a value import would survive and blow up
    // the data-URL import below, which is exactly the signal we want.
    tsconfigRaw: { compilerOptions: { verbatimModuleSyntax: true } },
  });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
}

/** The `astralis-ui` components a block composes, in source order. */
function deriveUses(source) {
  const named = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']astralis-ui["']/g)];
  const uses = named.flatMap(([, group]) =>
    group
      .split(",")
      .map((entry) => entry.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean),
  );
  return [...new Set(uses)].sort();
}

function deriveComponent(source) {
  return source.match(/export\s+function\s+([A-Z]\w*)/)?.[1] ?? null;
}

/** Every module specifier a block imports from. */
function deriveImports(source) {
  return [...source.matchAll(/from\s*["']([^"']+)["']/g)].map(([, specifier]) => specifier);
}

/* -------------------------------------------------------------------------- */
/* Authoring rules — the gates that keep copied-out blocks clean               */
/* -------------------------------------------------------------------------- */

function validate(meta, { id, category, family, dir, entry, source, files }) {
  if (meta.id !== id) fail(id, `meta.id is "${meta.id}" but the folder is "${id}"`);
  if (meta.category !== category) fail(id, `meta.category is "${meta.category}" but it lives under "${category}"`);
  if (meta.family !== family) fail(id, `meta.family is "${meta.family}" but it lives under "${family}"`);
  // The id is the family plus a zero-padded counter — nothing else. Padding
  // keeps 02 sorting before 10 in the registry, on disk and in the gallery.
  if (!new RegExp(`^${family}-\\d{2}$`).test(id)) {
    fail(id, `id must be "${family}-{nn}" with a two-digit counter, e.g. "${family}-01"`);
  }
  if (!files.includes(entry)) fail(id, `missing entry file "${entry}" in ${relative(ROOT, dir)}`);
  if (!meta.name?.trim()) fail(id, "meta.name is required — it is the docs card label");
  if (!meta.description?.trim()) fail(id, "meta.description is required");

  // A block is written in the PUBLIC consumer dialect: the astralis: prefix is
  // internal plumbing and must never land in someone else's repo.
  if (source.includes("astralis:")) {
    fail(id, "uses an `astralis:` prefixed class — blocks style via props, `style`, or plain className");
  }

  // Compound namespace access (<Grid.Item>, <List.Item>, <Card.Body>) resolves
  // to undefined across the RSC boundary — a client-reference stub carries no
  // static properties. Blocks are copied into apps where Server Components are
  // the default, so they must use the flat exports (GridItem, ListItem, …).
  for (const [, tag] of source.matchAll(/<([A-Z]\w*\.\w+)/g)) {
    const flat = tag.replace(".", "");
    fail(id, `uses <${tag}> — compound access breaks in Server Components; import { ${flat} } instead`);
  }

  // Blocks must stay framework-agnostic and dependency-free so a copy always compiles.
  for (const specifier of deriveImports(source)) {
    const allowed =
      specifier === "astralis-ui" ||
      specifier === "react" ||
      specifier.startsWith("./") ||
      specifier.startsWith("../");
    if (!allowed) fail(id, `imports "${specifier}" — blocks may only import astralis-ui, react, or siblings`);
  }
}

/* -------------------------------------------------------------------------- */
/* Walk                                                                        */
/* -------------------------------------------------------------------------- */

const dirsIn = (path) =>
  readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const blocks = [];

for (const category of dirsIn(SRC).filter((name) => CATEGORIES.includes(name))) {
  for (const family of dirsIn(join(SRC, category))) {
    for (const id of dirsIn(join(SRC, category, family))) {
      const dir = join(SRC, category, family, id);
      const entry = `${id}.tsx`;
      const metaFile = join(dir, "meta.ts");

      if (!existsSync(metaFile)) {
        fail(id, `no meta.ts in ${relative(ROOT, dir)}`);
        continue;
      }

      const files = readdirSync(dir)
        .filter((name) => name.endsWith(".tsx") || name.endsWith(".ts"))
        .filter((name) => name !== "meta.ts")
        .sort((a, b) => (a === entry ? -1 : b === entry ? 1 : a.localeCompare(b)));

      const source = existsSync(join(dir, entry)) ? readFileSync(join(dir, entry), "utf8") : "";
      const meta = (await loadMeta(metaFile)).default;

      validate(meta, { id, category, family, dir, entry, source, files });

      const component = deriveComponent(source);
      if (!component) fail(id, `no exported component found in ${entry} — expected \`export function Xxx()\``);

      blocks.push({
        ...meta,
        files,
        component: component ?? "",
        uses: deriveUses(source),
        contents: files.map((name) => ({
          path: name,
          content: readFileSync(join(dir, name), "utf8"),
        })),
        dir,
      });
    }
  }
}

if (errors.length) {
  console.error(`[astralis] block registry — ${errors.length} problem(s):\n${errors.join("\n")}`);
  process.exit(1);
}

blocks.sort((a, b) => a.id.localeCompare(b.id));

/* -------------------------------------------------------------------------- */
/* Emit                                                                        */
/* -------------------------------------------------------------------------- */

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

const catalogue = blocks.map(({ contents, dir, ...entry }) => entry);

const generated = [
  "/* ==========================================================================",
  "   AUTO-GENERATED — DO NOT EDIT BY HAND",
  "   Source: scripts/build-registry.mjs",
  "   The live component behind every registry id, for docs previews and Studio.",
  "   ========================================================================== */",
  "",
  'import type { JSX } from "react";',
  'import type { BlockRegistryEntry } from "./registry";',
  ...blocks.map(
    ({ id, component, category, family, files }) =>
      `import { ${component} } from "./${category}/${family}/${id}/${files[0].replace(/\.tsx$/, "")}";`,
  ),
  ...blocks.map(
    ({ id, category, family }) =>
      `import ${camel(id)}Meta from "./${category}/${family}/${id}/meta";`,
  ),
  "",
  "export interface BlockEntry {",
  "  meta: BlockRegistryEntry;",
  "  component: () => JSX.Element;",
  "}",
  "",
  "export const blocks = {",
  // The derived fields are spread in rather than cast on: meta.ts only carries
  // the hand-authored half, so a cast would leave `uses`/`files` undefined at runtime.
  ...blocks.flatMap(({ id, component, files, uses }) => [
    `  "${id}": {`,
    `    meta: {`,
    `      ...${camel(id)}Meta,`,
    `      files: ${JSON.stringify(files)},`,
    `      component: ${JSON.stringify(component)},`,
    `      uses: ${JSON.stringify(uses)},`,
    `    },`,
    `    component: ${component},`,
    `  },`,
  ]),
  "} as const satisfies Record<string, BlockEntry>;",
  "",
  "export type BlockId = keyof typeof blocks;",
  "",
].join("\n");

function camel(id) {
  return id.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

/**
 * The same source the CLI writes to disk, as a bundler-importable module. The
 * docs code tab renders from this, so what a reader copies and what
 * `astralis add` produces are the same bytes by construction. Kept out of
 * blocks.generated.ts so importing a component never drags source text into a
 * client bundle.
 */
const sources = [
  "/* ==========================================================================",
  "   AUTO-GENERATED — DO NOT EDIT BY HAND",
  "   Source: scripts/build-registry.mjs",
  "   Verbatim block source, for the docs code tab. Server-side use only.",
  "   ========================================================================== */",
  "",
  'import type { BlockId } from "./blocks.generated";',
  "",
  "export interface BlockSourceFile {",
  "  path: string;",
  "  content: string;",
  "}",
  "",
  "export const blockSources: Record<BlockId, BlockSourceFile[]> = {",
  ...blocks.map(({ id, contents }) => `  ${JSON.stringify(id)}: ${JSON.stringify(contents)},`),
  "};",
  "",
].join("\n");

const artifacts = [
  [join(ROOT, "src", "blocks.generated.ts"), generated],
  [join(ROOT, "src", "sources.generated.ts"), sources],
  [join(REGISTRY, "index.json"), json({ blocks: catalogue })],
  ...blocks.map(({ contents, dir, ...entry }) => [
    join(REGISTRY, "blocks", `${entry.id}.json`),
    json({ ...entry, contents }),
  ]),
];

if (CHECK) {
  const stale = artifacts.filter(
    ([path, content]) => !existsSync(path) || readFileSync(path, "utf8") !== content,
  );
  if (stale.length) {
    console.error(
      `[astralis] block registry is stale — run \`pnpm --filter astralis-blocks build\`:\n` +
        stale.map(([path]) => `  ${relative(ROOT, path)}`).join("\n"),
    );
    process.exit(1);
  }
  console.log(`[astralis] block registry: up to date (${blocks.length} block(s))`);
} else {
  // Rebuilt from scratch so a deleted block never lingers in the registry.
  rmSync(REGISTRY, { recursive: true, force: true });
  mkdirSync(join(REGISTRY, "blocks"), { recursive: true });
  for (const [path, content] of artifacts) writeFileSync(path, content);
  console.log(
    `[astralis] block registry: ${blocks.length} block(s) -> ${relative(ROOT, REGISTRY)}`,
  );
}
