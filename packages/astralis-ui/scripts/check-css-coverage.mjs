/* ==========================================================================
   ASTRALIS — CSS COVERAGE GATE (three parts)
   --------------------------------------------------------------------------
   The library ships precompiled CSS, so anything the components can emit but
   the stylesheet doesn't define fails SILENTLY in the browser. This script
   makes that failure loud at build time:

   1. KEYWORD classes — every `astralis:*` literal in src exists at base, and
      everything in the responsive scope also exists at all four breakpoints.

   2. CHANNEL completeness — every CHANNEL_PROPS slug has its fixed rule in
      the compiled CSS at base, at all four breakpoint suffixes, and at all
      three interaction states. Also asserts every @media / @container
      min-width in the shipped CSS comes from const/breakpoints.ts.

   3. TOKEN -> VALUE totality — every entry in every branded value map is a
      non-empty CSS value, contains no leftover class string, and every
      var(--astralis-*) it references is actually declared in the token CSS.
      (Imports the BUILT maps from dist, so it validates what ships.)

   Runs as part of `build:css` (after the vite build); exits non-zero on any
   miss.
   ========================================================================== */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import {
  collectAllTokens,
  collectResponsiveTokens,
  collectChannelSlugs,
} from "./token-scope.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = join(__dirname, "..");
const { BREAKPOINTS, BREAKPOINT_WIDTHS } = await import(
  pathToFileURL(join(PKG, "dist", "const", "breakpoints.js")).href
);
const STATES = ["hover", "focus-visible", "active"];
const CONTAINER_WIDTHS = BREAKPOINT_WIDTHS;
const CHANNEL_MAP_BRAND = Symbol.for("astralis.channel-map");

const missing = [];

/* ---- shared: every class selector defined in the compiled CSS ---------- */
const css = readFileSync(join(PKG, "dist", "styles.css"), "utf8");
const defined = new Set();
for (const m of css.matchAll(/\.((?:[^\s{},.:#()[\]>+~\\'"]|\\.)+)/g)) {
  defined.add(m[1].replace(/\\(.)/g, "$1"));
}

/* ---- part 1: keyword classes ------------------------------------------- */
const all = collectAllTokens();
const responsive = collectResponsiveTokens();

for (const bare of all) {
  if (!defined.has(`astralis:${bare}`)) {
    missing.push(`astralis:${bare}  [base]`);
    continue;
  }
  if (responsive.has(bare)) {
    for (const bp of BREAKPOINTS) {
      if (!defined.has(`astralis:${bp}:${bare}`)) {
        missing.push(`astralis:${bare}  [${bp} variant missing]`);
        break;
      }
    }
    for (const width of Object.values(CONTAINER_WIDTHS)) {
      if (!defined.has(`astralis:@min-[${width}]:${bare}`)) {
        missing.push(`astralis:${bare}  [@min-[${width}] container variant missing]`);
        break;
      }
    }
  }
}

/* ---- part 2: channel completeness -------------------------------------- */
const slugs = collectChannelSlugs();

for (const slug of slugs) {
  if (!defined.has(`astralis-${slug}`)) missing.push(`astralis-${slug}  [channel base]`);
  for (const bp of BREAKPOINTS) {
    if (!defined.has(`astralis-${slug}-${bp}`)) {
      missing.push(`astralis-${slug}-${bp}  [channel breakpoint]`);
    }
    if (!defined.has(`astralis-${slug}-cq-${bp}`)) {
      missing.push(`astralis-${slug}-cq-${bp}  [channel container variant]`);
    }
  }
  for (const state of STATES) {
    if (!defined.has(`astralis-${state}-${slug}`)) {
      missing.push(`astralis-${state}-${slug}  [channel state]`);
    }
  }
}

// Every min-width query in the shipped CSS (Tailwind's sm..xl variants and the
// channel blocks alike) must use a width from const/breakpoints.ts.
const widths = new Set(Object.values(BREAKPOINT_WIDTHS));
for (const kind of ["media", "container"]) {
  const used = new Set(
    [...css.matchAll(new RegExp(`@${kind} \\(min-width: ?([\\d.]+rem)\\)`, "g"))].map((m) => m[1]),
  );
  for (const w of used) if (!widths.has(w)) missing.push(`@${kind} (min-width: ${w})  [breakpoint drift]`);
  for (const w of widths) if (!used.has(w)) missing.push(`@${kind} (min-width: ${w})  [breakpoint missing]`);
}
if (!defined.has("astralis-container")) {
  missing.push("astralis-container  [container establishment class]");
}

/* ---- part 3: token -> value totality ------------------------------------ */
// Every --astralis-* custom property declared in the token CSS (idents unescaped).
const declaredVars = new Set();
const tokensDir = join(PKG, "src", "theme", "tokens");
for (const f of readdirSync(tokensDir)) {
  if (!f.endsWith(".css")) continue;
  const text = readFileSync(join(tokensDir, f), "utf8");
  for (const m of text.matchAll(/(--astralis-[\w\\./-]+)\s*:/g)) {
    declaredVars.add(m[1].replace(/\\(.)/g, "$1"));
  }
}

const VALUE_MAP_MODULES = [
  "spacing-mappings.js",
  "sizing-mappings.js",
  "positioning-mappings.js",
  "rounded-mappings.js",
  "layout-mappings.js",
  "color-mappings.js",
  "common-mappings.js",
];

let valueMapCount = 0;
let tokenCount = 0;
for (const mod of VALUE_MAP_MODULES) {
  const url = pathToFileURL(join(PKG, "dist", "const", mod)).href;
  const exports = await import(url);
  for (const [name, value] of Object.entries(exports)) {
    if (!value || typeof value !== "object" || value[CHANNEL_MAP_BRAND] !== true) continue;
    valueMapCount++;
    for (const [token, cssValue] of Object.entries(value)) {
      tokenCount++;
      if (typeof cssValue !== "string" || cssValue.length === 0) {
        missing.push(`${name}.${token} = ${JSON.stringify(cssValue)}  [empty value]`);
        continue;
      }
      if (cssValue.includes("astralis:")) {
        missing.push(`${name}.${token} = "${cssValue}"  [class string left in a value map]`);
        continue;
      }
      for (const ref of cssValue.matchAll(/var\((--astralis-[^),\s]+)/g)) {
        const ident = ref[1].replace(/\\(.)/g, "$1");
        if (!declaredVars.has(ident)) {
          missing.push(`${name}.${token} -> var(${ref[1]})  [undeclared token variable]`);
        }
      }
    }
  }
}

/* ---- verdict ------------------------------------------------------------ */
if (missing.length) {
  console.error(
    `[astralis] CSS COVERAGE FAILURE — ${missing.length} problem(s):`,
  );
  for (const line of missing.sort()) console.error("  " + line);
  console.error(
    "[astralis] Every emitted class must compile and every value-map entry must resolve. Fix the token/map, channels.css, or the @theme key.",
  );
  process.exit(1);
}

console.log(
  `[astralis] css coverage: ${all.size} keyword base + ${responsive.size} responsive x ${BREAKPOINTS.length}` +
    ` | ${slugs.length} channel slugs x (base + ${BREAKPOINTS.length} bp + ${STATES.length} states)` +
    ` | ${tokenCount} tokens across ${valueMapCount} value maps all resolve`,
);
