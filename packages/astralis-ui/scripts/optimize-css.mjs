/* ==========================================================================
   ASTRALIS — STYLESHEET OPTIMISER (runs right after Tailwind, before the gates)
   --------------------------------------------------------------------------
   Two rewrites of the minified sheet that change no computed style:

   1. Dead declarations. A redefined keyword utility (`@utility flex` in
      tailwind-entry.css) ships next to Tailwind's built-in of the same name,
      so the rule carries both `display:flex` and `display:var(...)`. The
      earlier of two declarations of one property only matters as a parse-time
      fallback, and a value with var() never fails to parse, so when either of
      the pair reads a var() the earlier one can never apply and is dropped.
      Plain fallback pairs (`100vh` then `100dvh`) are kept.

   2. Breakpoint blocks regrouped for compression. Tailwind writes the
      responsive safelist as eight blocks (four @media, four @container), one
      copy of every keyword utility each, ~40 kB apart. gzip only matches text
      within 32 kB, so it compressed each copy from scratch. The blocks are
      split per "conflict group" (utilities that set the same CSS property, or
      a shorthand and its longhands, are one group) and each group's eight
      slices are written next to each other, in the original block order.
      Only rules that set a common property can override each other, and
      their relative order is unchanged, so the cascade gives the same answer
      for every element; utilities in different groups never compete.

   The coverage, contrast and motion gates and the system spec all read the
   rewritten file.
   ========================================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] ?? join(__dirname, "..", "dist", "styles.css");

/* ---- a parser for minified CSS: at-rules, rules, declarations ---------- */

function fail(message) {
  console.error(`[astralis] optimize-css: ${message}`);
  process.exit(1);
}

/** Index just past the string or comment starting at i, or i when there is none. */
function skipOpaque(css, i) {
  const c = css[i];
  if (c === '"' || c === "'") {
    for (let j = i + 1; j < css.length; j++) {
      if (css[j] === "\\") j++;
      else if (css[j] === c) return j + 1;
    }
    fail("unterminated string");
  }
  if (c === "/" && css[i + 1] === "*") {
    const end = css.indexOf("*/", i + 2);
    if (end === -1) fail("unterminated comment");
    return end + 2;
  }
  if (c === "\\") return i + 2;
  return i;
}

/** Parses the body of a block into nodes. Returns [nodes, indexAfterClosingBrace]. */
function parseBlock(css, i, topLevel) {
  const nodes = [];
  let start = i;
  let depth = 0; // parentheses
  while (i < css.length) {
    const skipped = skipOpaque(css, i);
    if (skipped !== i) {
      if (css[i] === "/" && depth === 0 && css.slice(start, i).trim() === "") {
        nodes.push({ type: "comment", text: css.slice(i, skipped) });
        start = skipped;
      }
      i = skipped;
      continue;
    }
    const c = css[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && c === "{") {
      const prelude = css.slice(start, i).trim();
      if (prelude.startsWith("@")) {
        const [children, next] = parseBlock(css, i + 1, false);
        nodes.push({ type: "at", prelude, children });
        i = next;
      } else {
        const close = findClose(css, i + 1);
        const body = css.slice(i + 1, close);
        nodes.push({ type: "rule", prelude, decls: splitDecls(body) });
        i = close + 1;
      }
      start = i;
      continue;
    } else if (depth === 0 && c === "}") {
      if (topLevel) fail("unbalanced closing brace");
      if (css.slice(start, i).trim() !== "") nodes.push({ type: "decls", decls: splitDecls(css.slice(start, i)) });
      return [nodes, i + 1];
    } else if (depth === 0 && c === ";" && css.slice(start, i).trim().startsWith("@")) {
      nodes.push({ type: "statement", text: css.slice(start, i).trim() });
      start = i + 1;
    }
    i++;
  }
  if (!topLevel) fail("unterminated block");
  if (css.slice(start).trim() !== "") fail(`trailing text: ${css.slice(start, start + 60)}`);
  return [nodes, i];
}

/** Closing brace of a declaration block; a nested block inside a rule is refused. */
function findClose(css, i) {
  let depth = 0;
  for (; i < css.length; i++) {
    const skipped = skipOpaque(css, i);
    if (skipped !== i) {
      i = skipped - 1;
      continue;
    }
    const c = css[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && c === "{") fail(`nested block inside a rule near: ${css.slice(Math.max(0, i - 80), i)}`);
    else if (depth === 0 && c === "}") return i;
  }
  fail("unterminated rule");
}

function splitDecls(body) {
  const decls = [];
  let start = 0;
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const skipped = skipOpaque(body, i);
    if (skipped !== i) {
      i = skipped - 1;
      continue;
    }
    const c = body[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && c === ";") {
      pushDecl(decls, body.slice(start, i));
      start = i + 1;
    }
  }
  pushDecl(decls, body.slice(start));
  return decls;
}

function pushDecl(decls, text) {
  const t = text.trim();
  if (t === "") return;
  const colon = t.indexOf(":");
  if (colon === -1) fail(`declaration without a colon: ${t}`);
  decls.push({ prop: t.slice(0, colon).trim(), value: t.slice(colon + 1).trim(), text: t });
}

const serializeDecls = (decls) => decls.map((d) => d.text).join(";");
function serialize(nodes) {
  return nodes
    .map((n) => {
      if (n.type === "comment") return n.text;
      if (n.type === "statement") return `${n.text};`;
      if (n.type === "decls") return serializeDecls(n.decls);
      if (n.type === "rule") return `${n.prelude}{${serializeDecls(n.decls)}}`;
      return `${n.prelude}{${serialize(n.children)}}`;
    })
    .join("");
}

/* ---- 1. dead declarations --------------------------------------------- */

const hasVar = (value) => /\bvar\(/.test(value);
let droppedDecls = 0;

function dropDeadDecls(decls) {
  const kept = [];
  for (let i = 0; i < decls.length; i++) {
    const d = decls[i];
    const later = decls.slice(i + 1).find((e) => e.prop === d.prop);
    // !important changes which one wins; leave such pairs alone.
    const important = (x) => /!important$/i.test(x.value);
    if (later && !important(d) && !important(later) && (d.prop.startsWith("--") || hasVar(d.value) || hasVar(later.value))) {
      droppedDecls++;
      continue;
    }
    kept.push(d);
  }
  return kept;
}

function walkDecls(nodes) {
  for (const n of nodes) {
    if (n.type === "rule" || n.type === "decls") n.decls = dropDeadDecls(n.decls);
    else if (n.type === "at" && !/^@(keyframes|font-face|property)\b/.test(n.prelude)) walkDecls(n.children);
  }
}

/* ---- 2. breakpoint blocks regrouped ------------------------------------ */

const BREAKPOINT_BLOCK = /^@(media|container) ?\(min-width: ?[\d.]+rem\)$/;

// Properties that can set the same value as each other belong to one family.
const SHARED_FAMILIES = [
  ["place", "align", "justify"],
  ["inset", "top", "right", "bottom", "left"],
  ["width", "height", "inline", "block", "min", "max", "size"],
  ["gap", "row", "column", "columns", "grid"],
];
function familyOf(prop) {
  if (prop.startsWith("--")) return prop;
  const bare = prop.replace(/^-(webkit|moz|ms|o)-/, "");
  if (bare === "all") return "*";
  const head = bare.split("-")[0];
  const shared = SHARED_FAMILIES.find((f) => f.includes(head));
  return shared ? shared[0] : head;
}

function propsOf(node, acc = new Set()) {
  if (node.type === "rule" || node.type === "decls") for (const d of node.decls) acc.add(d.prop);
  else if (node.type === "at") for (const c of node.children) propsOf(c, acc);
  return acc;
}

let regrouped = null;

function regroupBreakpointRun(blocks) {
  // union-find over items, joined by the families of the properties they set
  const items = [];
  blocks.forEach((block, b) => block.children.forEach((node) => items.push({ b, node })));
  const parent = items.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const owner = new Map();
  let everything = null;
  items.forEach((item, i) => {
    for (const prop of propsOf(item.node)) {
      const family = familyOf(prop);
      if (family === "*") everything ??= i;
      if (owner.has(family)) parent[find(i)] = find(owner.get(family));
      else owner.set(family, i);
    }
    if (item.node.type === "comment" || item.node.type === "statement") fail("unexpected node inside a breakpoint block");
  });
  if (everything !== null) items.forEach((_, i) => (parent[find(i)] = find(everything)));

  const groups = new Map(); // root -> items, in first-appearance order
  items.forEach((item, i) => {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(item);
  });
  const out = [];
  for (const members of groups.values()) {
    blocks.forEach((block, b) => {
      const children = members.filter((m) => m.b === b).map((m) => m.node);
      if (children.length) out.push({ type: "at", prelude: block.prelude, children });
    });
  }
  regrouped = { blocks: blocks.length, groups: groups.size, rules: items.length };
  return out;
}

function regroupUtilities(nodes) {
  const layer = nodes.find((n) => n.type === "at" && n.prelude === "@layer utilities");
  if (!layer) fail("no @layer utilities block");
  const kids = layer.children;
  // the longest contiguous run of breakpoint blocks is the responsive safelist
  let best = null;
  for (let i = 0; i < kids.length; ) {
    let j = i;
    while (j < kids.length && kids[j].type === "at" && BREAKPOINT_BLOCK.test(kids[j].prelude)) j++;
    if (j > i && (!best || j - i > best[1] - best[0])) best = [i, j];
    i = j > i ? j : i + 1;
  }
  if (!best || best[1] - best[0] < 2) fail("no run of breakpoint blocks in @layer utilities");
  const run = kids.slice(best[0], best[1]);
  layer.children = [...kids.slice(0, best[0]), ...regroupBreakpointRun(run), ...kids.slice(best[1])];
}

/* ---- run ---------------------------------------------------------------- */

const input = readFileSync(file, "utf8");
const [nodes] = parseBlock(input, 0, true);
// A round trip that changes more than the line breaks between top-level
// nodes means the parser misread something.
if (serialize(nodes) !== input.replace(/\n/g, "")) fail("parse/serialize round trip is not exact; refusing to rewrite");
walkDecls(nodes);
regroupUtilities(nodes);
const output = serialize(nodes);
writeFileSync(file, output);
console.log(
  `[astralis] optimize-css: ${droppedDecls} dead declarations dropped; ${regrouped.rules} breakpoint rules in ${regrouped.blocks} blocks regrouped into ${regrouped.groups} groups; ${input.length} -> ${output.length} bytes`,
);
