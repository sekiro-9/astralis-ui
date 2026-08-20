/* ==========================================================================
   ASTRALIS — DIST MODULE GRAPH
   --------------------------------------------------------------------------
   Shared by check-server-safe.mjs (the gate) and gen-system-spec.mjs (the
   spec's per-component client field). Works on dist/ because dist is what
   consumers' bundlers see: preserveModules keeps one output module per source
   module, and the "use client" banner mirrors the source directive, so the
   built graph IS the shipped client/server boundary.

   Three views:
   - buildGraph(dist)     → per-module relative imports + isClient flag
   - exportsOf(dist, mod) → export name → defining module (follows re-exports)
   - reachableClient(...) → the client modules a module pulls in transitively
   ========================================================================== */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative, sep } from "node:path";

function listJsModules(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) listJsModules(full, out);
    else if (entry.endsWith(".js")) out.push(full);
  }
  return out;
}

const rel = (dist, file) => relative(dist, file).split(sep).join("/");

/** Relative import/re-export specifiers of one built module. */
function moduleSpecifiers(source) {
  const specs = new Set();
  // Bundled ESM keeps imports/re-exports as single statements; match every
  // `from "…"` plus bare side-effect imports, then keep the relative ones —
  // bare specifiers are externals (react, clsx) and out of scope.
  for (const m of source.matchAll(/\bfrom\s*["']([^"']+)["']/g)) specs.add(m[1]);
  for (const m of source.matchAll(/^import\s*["']([^"']+)["']/gm)) specs.add(m[1]);
  return [...specs].filter((s) => s.startsWith("."));
}

export function buildGraph(dist) {
  const modules = new Map(); // rel path -> { isClient, imports: rel paths }
  for (const file of listJsModules(dist)) {
    const source = readFileSync(file, "utf8");
    const isClient = /^["']use client["']/.test(source.trimStart());
    const imports = moduleSpecifiers(source)
      .map((spec) => rel(dist, resolve(dirname(file), spec)))
      .filter((p) => p.endsWith(".js"));
    modules.set(rel(dist, file), { isClient, imports });
  }
  return modules;
}

/** Transitive client modules reachable from `entry` (inclusive of itself). */
export function reachableClient(modules, entry) {
  const seen = new Set();
  const client = new Set();
  const stack = [entry];
  while (stack.length) {
    const current = stack.pop();
    if (seen.has(current)) continue;
    seen.add(current);
    const mod = modules.get(current);
    if (!mod) continue; // e.g. a .css.js asset that was filtered
    if (mod.isClient) client.add(current);
    stack.push(...mod.imports);
  }
  return client;
}

/**
 * Per-component client classification, for the spec's `client` field and the
 * docs badges:
 *   "none"     — no client module reachable: rendering it ships 0 KB of
 *                library JS (the badge tier);
 *   "leaf"     — the component itself renders on the server but some part of
 *                its graph is client (CodeBlock: server shell + CopyTrigger);
 *   "required" — the component function itself is a client module.
 *
 * For compounds assembled with `Object.assign(Root, parts)` in a server index
 * module, the verdict follows the ROOT: `<Menu>` hydrates because MenuRoot is
 * client, even though menu/index.js is not.
 */
export function classifyClient(modules, dist) {
  const publicExports = exportsOf(modules, dist, "index.js");
  const result = new Map();
  for (const [name, definingModule] of publicExports) {
    if (!/^[A-Z]/.test(name) || /^[A-Z0-9_]+$/.test(name)) continue; // components only
    let rootModule = definingModule;
    const mod = modules.get(definingModule);
    if (mod && !mod.isClient) {
      // Compound facade? Follow Object.assign's first argument to the root.
      let source = "";
      try {
        source = readFileSync(join(dist, definingModule), "utf8");
      } catch {
        /* fall through with the defining module */
      }
      const assign = source.match(/Object\.assign\(\s*([\w$]+)\s*,/);
      if (assign) {
        const imported = importMapOf(source, dist, definingModule).get(assign[1]);
        if (imported) rootModule = imported.module;
      }
    }
    const required = modules.get(rootModule)?.isClient ?? false;
    const client = required ? "required" : reachableClient(modules, definingModule).size ? "leaf" : "none";
    result.set(name, client);
  }
  return result;
}

const EXPORT_FROM = /export\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
const EXPORT_STAR = /export\s*\*\s*from\s*["']([^"']+)["']/g;
const EXPORT_LOCAL =
  /export\s+(?:default\s+)?(?:const|let|var|function|class)\s+([\w$]+)|export\s*\{([^}]*)\}(?!\s*from)/g;
// Rollup facades import bindings then re-export them in one bare block:
//   import Card from "./card-root.js";  …  export { Card, CardBody };
const IMPORT_NAMED = /import\s*(?:([\w$]+)\s*,\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
const IMPORT_DEFAULT = /import\s+([\w$]+)\s+from\s*["']([^"']+)["']/g;

/** local binding name -> { module (rel path), original export name } */
function importMapOf(source, dist, entry) {
  const file = join(dist, entry);
  const importedFrom = new Map();
  for (const m of source.matchAll(IMPORT_NAMED)) {
    if (!m[3].startsWith(".")) continue; // externals define nothing of ours
    const target = rel(dist, resolve(dirname(file), m[3]));
    if (m[1]) importedFrom.set(m[1], { module: target, original: "default" });
    for (const piece of m[2].split(",")) {
      const [from, as] = piece.split(/\s+as\s+/).map((s) => s.trim());
      if (from) importedFrom.set(as ?? from, { module: target, original: from });
    }
  }
  for (const m of source.matchAll(IMPORT_DEFAULT)) {
    if (!m[2].startsWith(".")) continue;
    const target = rel(dist, resolve(dirname(file), m[2]));
    importedFrom.set(m[1], { module: target, original: "default" });
  }
  return importedFrom;
}

/**
 * Export name → defining module (rel path), following re-export chains.
 * "Defining" = the module whose code creates the binding; for compounds
 * assembled with Object.assign in an index module, that index module.
 */
export function exportsOf(modules, dist, entry, cache = new Map()) {
  if (cache.has(entry)) return cache.get(entry);
  const result = new Map();
  cache.set(entry, result); // set early: cycles resolve to partial maps
  const file = join(dist, entry);
  let source;
  try {
    source = readFileSync(file, "utf8");
  } catch {
    return result;
  }

  for (const m of source.matchAll(EXPORT_STAR)) {
    const target = rel(dist, resolve(dirname(file), m[1]));
    for (const [name, def] of exportsOf(modules, dist, target, cache)) {
      if (name !== "default") result.set(name, def);
    }
  }
  for (const m of source.matchAll(EXPORT_FROM)) {
    const target = rel(dist, resolve(dirname(file), m[2]));
    const targetExports = exportsOf(modules, dist, target, cache);
    for (const piece of m[1].split(",")) {
      const [from, as] = piece.split(/\s+as\s+/).map((s) => s.trim());
      if (!from) continue;
      result.set(as ?? from, targetExports.get(from) ?? target);
    }
  }
  // Local bindings that came in via import — a bare `export { X }` of an
  // imported name is a re-export, and the definer is upstream.
  const importedFrom = importMapOf(source, dist, entry);

  const definerOf = (localName) => {
    const imported = importedFrom.get(localName);
    if (!imported) return entry;
    if (imported.original === "default") return imported.module;
    const upstream = exportsOf(modules, dist, imported.module, cache);
    return upstream.get(imported.original) ?? imported.module;
  };

  for (const m of source.matchAll(EXPORT_LOCAL)) {
    if (m[1]) result.set(m[1], entry);
    else if (m[2]) {
      for (const piece of m[2].split(",")) {
        const [from, as] = piece.split(/\s+as\s+/).map((s) => s.trim());
        const name = as ?? from;
        if (name && !result.has(name)) result.set(name, definerOf(from));
      }
    }
  }
  return result;
}
