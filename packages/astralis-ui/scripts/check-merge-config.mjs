/* ==========================================================================
   ASTRALIS — MERGE CONFIG GATE
   --------------------------------------------------------------------------
   `astralisMerge` runs on a cut-down tailwind-merge config generated from the
   compiled stylesheet (scripts/merge-config.mjs). This gate proves the cut
   changes nothing:

   1. FRESH — regenerating from dist/styles.css gives the committed
      src/utils/merge-config.generated.ts byte for byte. The fix is
      `pnpm --filter astralis-ui gen:merge-config`, then build again.

   2. EQUIVALENT — the built astralisMerge (dist/) and tailwind-merge with the full
      default config plus the library's additions return the same string, over
      the classes in dist/styles.css (every variant form, e.g.
      `astralis:hover:...`, `astralis:sm:...`):
        - every class alone;
        - every pair whose base utilities share a root (`p-4` / `sm:px-2`),
          in both orders;
        - every pair across groups the full config lists as conflicting
          (including the postfix-modifier conflicts), in both orders;
        - a fixed-seed random sample of other pairs and triples, with a few
          non-library class names mixed in.

   Runs in `build:css` after the coverage gate; exits non-zero on any miss.
   ========================================================================== */

import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { extendTailwindMerge } from "tailwind-merge";
import {
  ASTRALIS_EXTENSION,
  OUTPUT,
  PKG,
  buildMergeConfig,
  emitMergeConfig,
  fullConfig,
  stylesheetClasses,
  twInternals,
} from "./merge-config.mjs";

const fail = (msg) => {
  console.error(`[astralis] merge config: ${msg}`);
  process.exit(1);
};

const classes = stylesheetClasses();

/* --- 1. the committed file is fresh ------------------------------------- */
const expected = emitMergeConfig(await buildMergeConfig(classes));
const committed = readFileSync(OUTPUT, "utf8").replace(/\r\n/g, "\n");
if (committed !== expected) {
  fail(
    `${relative(PKG, OUTPUT)} is stale against dist/styles.css. ` +
      "Run `pnpm --filter astralis-ui gen:merge-config`, then build again.",
  );
}

/* --- 2. the cut config merges exactly like the full one ------------------ */
// The BUILT module, so the gate checks what ships.
const { astralisMerge } = await import(pathToFileURL(join(PKG, "dist", "utils", "astralis-merge.js")).href);
const fullMerge = extendTailwindMerge(ASTRALIS_EXTENSION);

const { createClassGroupUtils, createParseClassName } = await twInternals();
const full = fullConfig();
const parse = createParseClassName(full);
const { getClassGroupId } = createClassGroupUtils(full);

const N = classes.length;
const rootOf = new Array(N);
const groupOf = new Array(N);
for (let i = 0; i < N; i++) {
  const { isExternal, baseClassName, maybePostfixModifierPosition } = parse(classes[i]);
  if (isExternal) continue;
  const parts = baseClassName.split("-");
  rootOf[i] = parts[0] === "" && parts.length > 1 ? parts[1] : parts[0];
  const bare = maybePostfixModifierPosition
    ? baseClassName.substring(0, maybePostfixModifierPosition)
    : baseClassName;
  groupOf[i] = getClassGroupId(bare) ?? getClassGroupId(baseClassName);
}

let compared = 0;
const mismatches = [];
const compare = (input) => {
  compared++;
  const want = fullMerge(input);
  const got = astralisMerge(input);
  if (want !== got && mismatches.length < 20) mismatches.push({ input, want, got });
};

/* singles */
for (const c of classes) compare(c);

/* pairs: every unordered pair once, compared in both orders */
const seen = new Set();
let pairs = 0;
const comparePair = (i, j) => {
  if (i === j) return;
  const key = i < j ? i * N + j : j * N + i;
  if (seen.has(key)) return;
  seen.add(key);
  pairs++;
  compare(`${classes[i]} ${classes[j]}`);
  compare(`${classes[j]} ${classes[i]}`);
};

const index = (keyOf) => {
  const map = new Map();
  for (let i = 0; i < N; i++) {
    const k = keyOf[i];
    if (k === undefined) continue;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(i);
  }
  return map;
};

const byRoot = index(rootOf);
for (const list of byRoot.values()) {
  for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) comparePair(list[a], list[b]);
}
const rootPairs = pairs;

const byGroup = index(groupOf);
for (const [group, list] of byGroup) {
  const others = new Set([
    ...(full.conflictingClassGroups[group] ?? []),
    ...(full.conflictingClassGroupModifiers[group] ?? []),
  ]);
  for (const other of others) {
    for (const j of byGroup.get(other) ?? []) for (const i of list) comparePair(i, j);
  }
}
const conflictPairs = pairs - rootPairs;

/* random pairs and triples (mulberry32, fixed seed: the same sample every run) */
let seed = 0x5eed1e55;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pool = [...classes, "p-4", "flex", "text-red-500", "my-card", "astralis"];
const pick = () => pool[Math.floor(rand() * pool.length)];
const RANDOM_PAIRS = 200_000;
const RANDOM_TRIPLES = 200_000;
for (let k = 0; k < RANDOM_PAIRS; k++) compare(`${pick()} ${pick()}`);
for (let k = 0; k < RANDOM_TRIPLES; k++) compare(`${pick()} ${pick()} ${pick()}`);

if (mismatches.length) {
  for (const m of mismatches) {
    console.error(`  "${m.input}"\n    full config: "${m.want}"\n    generated:   "${m.got}"`);
  }
  fail(`the generated config merges differently from the full config (first ${mismatches.length} shown)`);
}

console.log(
  `[astralis] merge config: fresh; ${N} classes, ${rootPairs} same-root + ${conflictPairs} conflicting-group pairs ` +
    `(both orders), ${RANDOM_PAIRS} random pairs + ${RANDOM_TRIPLES} triples: ${compared} merges equal the full config`,
);
