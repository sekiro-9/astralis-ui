/* ==========================================================================
   ASTRALIS — TOKEN SYNC GATE
   --------------------------------------------------------------------------
   Drift checks for everything that used to be "remember to keep these in sync":

   1. The generated stylesheets (semantic, accent, breakpoints, channels) match
      what scripts/token-css.mjs emits from the TypeScript tables. A hand edit
      to one desyncs it from the runtime that reads the same tables.

   2. The numeric scale tables in token-spec.ts (SPACING_SCALE, RADIUS_SCALE,
      FONT_SIZE_SCALE) match the hand-authored CSS they mirror. Those files stay
      authored because they carry non-scalable siblings (border styles, font
      weights), so this asserts the mirror instead of generating it.

   3. SCALE_GROUPS aliases match the @theme block.

   4. COLOR_SCHEMES lists exactly the palettes in HUES.

   Run via `pnpm run check:tokens` (wired into build:css).
   ========================================================================== */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import {
  OUTPUTS,
  accentCss,
  breakpointsCss,
  channelsCss,
  loadLayout,
  loadPalette,
  loadSpec,
  semanticCss,
} from "./token-css.mjs";
import { loadTs } from "./load-ts.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = join(__dirname, "..");
const TOKENS = join(PKG, "src", "theme", "tokens");

/** Read with line endings normalized to LF: a Windows checkout may be CRLF. */
const read = (file) => readFileSync(file, "utf8").replace(/\r\n/g, "\n");

const [spec, layout] = await Promise.all([loadSpec(), loadLayout()]);
const failures = [];

/* --- 1. generated stylesheets are in sync ------------------------------- */
const generated = {
  [OUTPUTS.semantic]: semanticCss(spec, loadPalette()),
  [OUTPUTS.accent]: accentCss(spec),
  [OUTPUTS.breakpoints]: breakpointsCss(layout),
  [OUTPUTS.channels]: channelsCss(layout),
};
for (const [path, expected] of Object.entries(generated)) {
  if (read(path) !== expected) {
    failures.push(
      `${relative(PKG, path).replace(/\\/g, "/")} is out of sync with its source table.\n` +
        "    Run `pnpm run gen:tokens` — and edit the TypeScript source, not the CSS.",
    );
  }
}

/* --- 2. scale tables mirror the authored CSS --------------------------- */
const parseScale = (file, prefix) => {
  const css = read(join(TOKENS, file));
  const out = {};
  const re = new RegExp(`--astralis-${prefix}-([a-z0-9\\\\.]+):\\s*([0-9.]+)rem;`, "g");
  for (const m of css.matchAll(re)) out[m[1].replace("\\", "")] = parseFloat(m[2]);
  return out;
};

const compare = (label, table, actual) => {
  for (const [step, value] of Object.entries(table)) {
    if (!(step in actual)) {
      failures.push(`${label}: token-spec has "${step}" but the CSS does not.`);
    } else if (Math.abs(actual[step] - value) > 1e-9) {
      failures.push(`${label}: "${step}" is ${value} in token-spec but ${actual[step]} in CSS.`);
    }
  }
  for (const step of Object.keys(actual)) {
    if (!(step in table)) failures.push(`${label}: CSS has "${step}" but token-spec does not.`);
  }
};

const parseMs = (file, prefix) => {
  const css = read(join(TOKENS, file));
  const out = {};
  const re = new RegExp(`--astralis-${prefix}-([a-z]+):\\s*([0-9.]+)ms;`, "g");
  for (const m of css.matchAll(re)) out[m[1]] = parseFloat(m[2]);
  return out;
};

compare("DURATION_SCALE", spec.DURATION_SCALE, parseMs("animation.css", "duration"));
compare("SPACING_SCALE", spec.SPACING_SCALE, parseScale("spacing.css", "spacing"));
compare("FONT_SIZE_SCALE", spec.FONT_SIZE_SCALE, parseScale("typography.css", "font-size"));
// Radius: "none" (0) and "full" (9999px) aren't rem values, so they're absent
// from the parsed set by construction and correctly absent from the table.
compare("RADIUS_SCALE", spec.RADIUS_SCALE, parseScale("border.css", "border-radius"));

/* --- 3. SCALE_GROUPS aliases match the @theme block --------------------- */
/*
 * A seed scales a group by writing its source token (and the alias older
 * stylesheets read). If the @theme mapping pointed that group's utilities at
 * anything else, the seed field would be a silent no-op, so assert every group
 * against the real mapping in tailwind-entry.css.
 */
const entry = read(join(__dirname, "..", "src", "tailwind-entry.css"));
const themeMap = new Map(); // tailwind name -> astralis source name
for (const m of entry.matchAll(/^\s*--([a-z0-9-]+):\s*var\(--astralis-([a-z0-9\\./-]+)\);/gim)) {
  themeMap.set(m[1], m[2].replace(/\\/g, ""));
}

for (const [key, group] of Object.entries(spec.SCALE_GROUPS)) {
  const table = {
    spacing: spec.SPACING_SCALE,
    radius: spec.RADIUS_SCALE,
    fontSize: spec.FONT_SIZE_SCALE,
    duration: spec.DURATION_SCALE,
  }[key];
  const step = Object.keys(table)[0];
  // Tailwind writes fractional steps with a dash: --spacing-0-5.
  const twName = `${group.alias ?? group.source}-${step.replace(".", "-")}`;
  const expected = `${group.source}-${step}`;
  const actual = themeMap.get(twName);
  if (actual === undefined) {
    failures.push(
      `SCALE_GROUPS.${key}: @theme has no "--${twName}" — the alias is wrong, ` +
        `so scaling this group would silently do nothing.`,
    );
  } else if (actual !== expected) {
    failures.push(
      `SCALE_GROUPS.${key}: @theme maps --${twName} to --astralis-${actual}, expected --astralis-${expected}.`,
    );
  }
}

/* --- 4. COLOR_SCHEMES lists exactly HUES ------------------------------- */
const [{ COLOR_SCHEMES }] = await loadTs("const/color-schemes.ts");
const schemes = new Set(COLOR_SCHEMES);
const hues = new Set(spec.HUES);
const notHues = [...schemes].filter((s) => !hues.has(s));
const notSchemes = [...hues].filter((h) => !schemes.has(h));
if (notHues.length || notSchemes.length || schemes.size !== COLOR_SCHEMES.length) {
  failures.push(
    `COLOR_SCHEMES must list each palette in HUES once — missing [${notSchemes}], unknown [${notHues}].`,
  );
}

if (failures.length) {
  console.error("\n✗ token sync check failed:\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error("");
  process.exit(1);
}
console.log("✓ tokens in sync (generated CSS, scale tables, @theme aliases, colour schemes)");
