/* ==========================================================================
   ASTRALIS — CONTRAST GATE
   --------------------------------------------------------------------------
   Fails the build when any promised text pairing (theme/contrast.ts
   contracts: labels on surfaces, contrast-on-solid, hue label-on-subtle)
   drops below WCAG AA against the SHIPPED palette, in either mode.

   Day-one catch: white text on green/teal/cyan/orange 600 solids shipped at
   3.3–3.7:1 for months while a comment asserted AA. The ratios in comments
   are opinions; this gate is the fact-checker. Seeded themes get the same
   contracts through `astralis theme` (CLI) and verifySeedContrast.
   ========================================================================== */

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = join(__dirname, "..");

const { verifyContrast, parsePaletteFromCss } = await import(
  pathToFileURL(join(PKG, "dist", "theme", "contrast.js")).href
);

const palette = parsePaletteFromCss(
  readFileSync(join(PKG, "src", "theme", "tokens", "color.css"), "utf8"),
);

const failures = [];
let total = 0;
for (const mode of ["light", "dark"]) {
  for (const r of verifyContrast((ref) => palette[ref], mode)) {
    total++;
    if (!r.pass) {
      failures.push(
        `[${mode}] ${r.rule}: ${r.fg}(${r.fgHex ?? "?"}) on ${r.bg}(${r.bgHex ?? "?"}) = ` +
          `${r.ratio?.toFixed(2) ?? "unresolvable"} — needs ${r.min}`,
      );
    }
  }
}

if (failures.length) {
  console.error(`[astralis] CONTRAST FAILURE — ${failures.length} broken pairing(s):`);
  for (const f of failures) console.error("  " + f);
  console.error(
    "[astralis] Fix the palette step, the role override (token-spec.ts OVERRIDES), or — if the promise itself changed — the contract in theme/contrast.ts.",
  );
  process.exit(1);
}

console.log(`[astralis] contrast: ${total} promised pairings clear WCAG AA in both modes`);
