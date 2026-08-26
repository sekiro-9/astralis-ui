/* ==========================================================================
   ASTRALIS — SERVER-BOUNDARY GATE (v2)
   --------------------------------------------------------------------------
   The client/server boundary is per-module: genuinely-client source files
   carry "use client", and the vite banner mirrors that into dist. This gate
   makes the boundary a build guarantee instead of an intention:

   1. MIRROR — every dist module's banner matches its source directive, both
      directions. Catches a stale banner rule, a directive typo, and the
      original v1 regression (theme core must stay bannerless so Node and
      Server Components get real values, not client references).

   2. ZERO-CLIENT SET — a curated list of public components that must reach
      NO client module through the dist import graph. These are the "0 KB
      client JS" badge holders; a hook or context sneaking into one fails the
      build loudly. The list only grows (de-contexting phases add compounds).

   Run with --report to print the client reachability of every public export
   without failing (used to review the set when the boundary moves).
   ========================================================================== */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildGraph, exportsOf, reachableClient } from "./module-graph.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const SRC = join(ROOT, "src");
const report = process.argv.includes("--report");

/**
 * Public components that must stay entirely server: importing and rendering
 * them ships zero library JS to the client. Grows as compounds are
 * de-contexted (Card, Table, Stat, … join in phases 2–3).
 */
const MUST_BE_ZERO_CLIENT = [
  // layout
  "Box",
  "Flex",
  "Grid",
  "Stack",
  "HStack",
  "VStack",
  "Center",
  "Container",
  "Separator",
  // typography
  "Heading",
  "Text",
  // static display & feedback
  "Badge",
  "Alert",
  "Progress",
  "Skeleton",
  "Spinner",
  // de-contexted compounds (phase 2): size/state travels via data attributes
  "Card",
  "CardHeader",
  "CardTitle",
  "CardDescription",
  "CardBody",
  "CardFooter",
  "Table",
  "TableHeader",
  "TableBody",
  "TableFooter",
  "TableRow",
  "TableHead",
  "TableCell",
  "TableCaption",
  // de-contexted compounds (phase 3): server-side cloning / data attributes
  "Stat",
  "StatLabel",
  "StatValue",
  "StatHelpText",
  "StatIndicator",
  "Timeline",
  "DataList",
  "DataListItem",
  "DataListLabel",
  "DataListValue",
  "Button",
  "ButtonGroup",
  "InputGroup",
  // CodeBlock stays "server shell + client leaf" (CopyTrigger), but its
  // static parts are individually zero-client:
  "CodeBlockContent",
  "CodeBlockCode",
  "CodeBlockHeader",
  "CodeBlockTitle",
  // zero-JS disclosure family: interactive WITH JavaScript disabled — the
  // whole point; a client module reaching these is a headline regression
  "Collapsible",
  "CollapsibleTrigger",
  "CollapsibleContent",
  "Popout",
  "PopoutTrigger",
  "PopoutContent",
  // batch of 2026-08-22: pure composition + platform primitives
  "EmptyState",
  "EmptyStateIndicator",
  "EmptyStateTitle",
  "EmptyStateDescription",
  "EmptyStateActions",
  "VisuallyHidden",
  "Backdrop",
  // medium tier: native scrollbars restyled with CSS, no JS thumb
  "ScrollArea",
];

const failures = [];

/* ---- 1. banner mirrors source ---------------------------------------- */

const modules = buildGraph(DIST);
let mirrored = 0;
for (const [relPath, mod] of modules) {
  const base = relPath.replace(/\.js$/, "");
  const srcFile = [".tsx", ".ts"].map((ext) => join(SRC, base + ext)).find(existsSync);
  if (!srcFile) {
    // Every dist module has a 1:1 source counterpart (preserveModules, no
    // helper chunks today). An orphan is a stale file from a deleted/renamed
    // source lingering because emptyOutDir is false — it would still ship in
    // the npm pack, so fail loudly rather than reason about its banner.
    failures.push(`${relPath} has no source counterpart — stale dist output; delete it (or clean dist/)`);
    continue;
  }
  const srcIsClient = readFileSync(srcFile, "utf8").trimStart().startsWith('"use client"');
  if (srcIsClient !== mod.isClient) {
    failures.push(
      srcIsClient
        ? `${relPath} is MISSING "use client" — its source declares it; the banner mirror is broken`
        : `${relPath} ships "use client" — its source does not declare it; a Server Component ` +
            `importing it gets a client reference instead of real values`,
    );
  }
  mirrored++;
}

/* ---- 2. the zero-client set ------------------------------------------ */

const publicExports = exportsOf(modules, DIST, "index.js");

if (report) {
  const rows = [];
  for (const [name, definingModule] of publicExports) {
    if (!/^[A-Z]/.test(name) || /^[A-Z0-9_]+$/.test(name)) continue; // components only
    const client = reachableClient(modules, definingModule);
    rows.push({ name, definingModule, client: client.size });
  }
  rows.sort((a, b) => a.client - b.client || a.name.localeCompare(b.name));
  for (const r of rows) {
    console.log(`${String(r.client).padStart(3)}  ${r.name}  (${r.definingModule})`);
  }
}

for (const name of MUST_BE_ZERO_CLIENT) {
  const definingModule = publicExports.get(name);
  if (!definingModule) {
    failures.push(`zero-client component "${name}" is not exported from the barrel`);
    continue;
  }
  const client = reachableClient(modules, definingModule);
  if (client.size > 0) {
    const list = [...client].slice(0, 5).join(", ");
    failures.push(
      `"${name}" must ship zero client JS but reaches ${client.size} client module(s): ${list}` +
        (client.size > 5 ? ", …" : ""),
    );
  }
}

/* ---- verdict ----------------------------------------------------------- */

if (failures.length) {
  console.error("\n✗ server-boundary check failed:\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error("");
  process.exit(1);
}

const clientCount = [...modules.values()].filter((m) => m.isClient).length;
console.log(
  `✓ server boundary: ${mirrored} dist modules mirror their source directive ` +
    `(${clientCount} client, ${mirrored - clientCount} server); ` +
    `${MUST_BE_ZERO_CLIENT.length} components verified zero-client`,
);
