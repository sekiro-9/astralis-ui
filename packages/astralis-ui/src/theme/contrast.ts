/* ==========================================================================
   ASTRALIS — CONTRAST CONTRACTS
   --------------------------------------------------------------------------
   The semantic layer PROMISES readable pairings: labels on the surfaces they
   sit on, contrast text on solid fills, a hue's `label` on its `subtle`.
   Until now those promises lived as hand-computed ratios in token-spec.ts
   comments — true for the shipped palette, verified by nobody, and silently
   voided the moment a consumer seeds their own brand colour.

   This module makes the promise checkable:
   - the CONTRACT LIST is derived from the same tables the tokens are built
     from (GLOBAL_SEMANTICS + roleTargets), never hand-listed twice;
   - `verifyContrast` checks any palette a resolver can describe — the shipped
     one (build gate: scripts/check-contrast.mjs fails the build on
     violation) or a runtime-generated one;
   - `verifySeedContrast` runs the SAME contracts against the palette a
     ThemeSeed actually produces, via the same generateThemeTokens the
     provider paints with — so "is my generated theme accessible?" has a
     machine answer (surfaced by `astralis theme`).

   WCAG 2.x contrast (relative luminance), AA thresholds. Dependency- and
   React-free like the rest of the theme core: runs in Node and the browser.
   ========================================================================== */

import { hexToRgb, contrastOn } from "./theme-math";
import { generateThemeTokens } from "./css-vars";
import {
  GLOBAL_SEMANTICS,
  HUES,
  roleTargets,
  roleRef,
  type Hue,
  type Mode,
  type ThemeSeed,
} from "./token-spec";

/** WCAG 2.x relative luminance of a hex colour (sRGB linearised). */
export function relativeLuminance(hex: string): number | undefined {
  const rgb = hexToRgb(hex);
  if (!rgb) return undefined;
  const lin = (c8: number) => {
    const c = c8 / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

/** WCAG 2.x contrast ratio between two hex colours, 1..21. */
export function contrastRatio(a: string, b: string): number | undefined {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === undefined || lb === undefined) return undefined;
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** One promised pairing: `fg` must clear `min` against `bg`. */
export interface ContrastContract {
  /** Primitive reference ("gray-900", "white", "brand-100") or "auto" for a
   *  hue's contrast-on-solid, resolved from the solid at check time. */
  fg: string;
  bg: string;
  min: number;
  /** What the pairing paints — the human-readable reason it is promised. */
  rule: string;
}

const AA = 4.5;

/**
 * The promised text pairings for one mode, derived from the token tables.
 * Neutral: every label rung on the surfaces content sits on. Hues: the
 * accent-subtle pattern (label on subtle — Alert, Badge, Tag) and solid fills
 * (contrast text on solid — Button). Strokes are decorative by design
 * (stroke-subtle is a deliberate ~1.27:1 divider) and are not text contracts.
 */
export function contrastContracts(mode: Mode): ContrastContract[] {
  const m = mode === "light" ? 0 : 1;
  const sem = (name: string) => GLOBAL_SEMANTICS[name][m];
  const contracts: ContrastContract[] = [];

  // Subtle text is promised on the PAGE (surface-base) only — on tinted
  // surfaces it is decoration by design (gray-500 on gray-100 is 4.40).
  for (const label of ["label-base", "label-muted", "label-subtle"]) {
    contracts.push({ fg: sem(label), bg: sem("surface-base"), min: AA, rule: `${label} on surface-base` });
  }
  for (const label of ["label-base", "label-muted"]) {
    contracts.push({ fg: sem(label), bg: sem("surface-subtle"), min: AA, rule: `${label} on surface-subtle` });
  }
  // The filled-control surface carries real content too, but only the two
  // stronger rungs — `subtle` on `muted` is the placeholder-on-input case the
  // palette deliberately trades away (see token-spec.ts).
  for (const label of ["label-base", "label-muted"]) {
    contracts.push({ fg: sem(label), bg: sem("surface-muted"), min: AA, rule: `${label} on surface-muted` });
  }
  contracts.push({
    fg: sem("label-inverted"),
    bg: sem("surface-inverted"),
    min: AA,
    rule: "label-inverted on surface-inverted",
  });

  for (const hue of HUES) {
    const t = roleTargets(hue, mode);
    contracts.push({
      fg: roleRef(hue, t.label),
      bg: roleRef(hue, t.subtle),
      min: AA,
      rule: `${hue}: label on subtle`,
    });
    contracts.push({
      fg: t.contrast === "auto" ? "auto" : roleRef(hue, t.contrast),
      bg: roleRef(hue, t.solid),
      min: AA,
      rule: `${hue}: contrast on solid`,
    });
  }
  return contracts;
}

/** A checked pairing. `ratio` is undefined when a hex could not be resolved. */
export interface ContrastResult extends ContrastContract {
  mode: Mode;
  fgHex?: string;
  bgHex?: string;
  ratio?: number;
  pass: boolean;
}

/**
 * Check every promised pairing against a palette. `resolve` maps a primitive
 * reference ("gray-900", "white", "brand-100") to its hex. An unresolvable
 * reference FAILS — a contract that cannot be checked is not a kept promise.
 */
export function verifyContrast(
  resolve: (ref: string) => string | undefined,
  mode: Mode,
): ContrastResult[] {
  return contrastContracts(mode).map((c) => {
    const bgHex = resolve(c.bg);
    const fgHex = c.fg === "auto" ? (bgHex ? contrastOn(bgHex) : undefined) : resolve(c.fg);
    const ratio = fgHex && bgHex ? contrastRatio(fgHex, bgHex) : undefined;
    return {
      ...c,
      mode,
      fgHex,
      bgHex,
      ratio,
      pass: ratio !== undefined && ratio >= c.min - 1e-9,
    };
  });
}

/**
 * Check a ThemeSeed's GENERATED palette — the exact vars the provider would
 * paint (same generateThemeTokens call) layered over the shipped palette.
 * `staticPalette` maps primitive refs to the shipped hexes (the CLI reads
 * them out of dist/styles.css; tests pass a literal map).
 */
export function verifySeedContrast(
  seed: ThemeSeed,
  staticPalette: Record<string, string>,
  modes: Mode[] = ["light", "dark"],
): ContrastResult[] {
  const results: ContrastResult[] = [];
  for (const mode of modes) {
    const generated = generateThemeTokens(seed, mode) as Record<string, string>;
    const resolve = (ref: string) =>
      generated[`--astralis-color-${ref}`] ?? staticPalette[ref];
    results.push(...verifyContrast(resolve, mode));
  }
  return results;
}

/** Parse `--astralis-color-*` primitives out of stylesheet text (the shipped
 *  styles.css or tokens/color.css) into a ref → hex map. */
export function parsePaletteFromCss(cssText: string): Record<string, string> {
  const palette: Record<string, string> = {};
  const aliases: Record<string, string> = {};
  for (const m of cssText.matchAll(
    /--astralis-color-([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}\b|var\(--astralis-color-[\w-]+\))/g,
  )) {
    // First declaration wins: :root light values, not the dark-mode block.
    const [, name, value] = m;
    if (value.startsWith("#")) {
      if (!(name in palette)) palette[name] = value;
    } else {
      // Role palettes (brand-*, error-*, ...) alias hues via var() — follow.
      // Tailwind's @theme layer also emits SELF-referential declarations
      // (--astralis-color-info-600: var(--astralis-color-info-600)) before
      // the real alias appears; those carry no information and must not win.
      const target = value.slice("var(--astralis-color-".length, -1);
      if (target !== name && !(name in aliases)) aliases[name] = target;
    }
  }
  for (const [name, target] of Object.entries(aliases)) {
    // One hop is the shipped depth; the loop guards against alias chains.
    let ref: string | undefined = target;
    for (let hop = 0; ref !== undefined && !(name in palette) && hop < 4; hop++) {
      if (palette[ref] !== undefined) palette[name] = palette[ref];
      else ref = aliases[ref];
    }
  }
  return palette;
}

// Hue is re-exported so callers can type per-hue reports without reaching
// into token-spec themselves.
export type { Hue, Mode, ThemeSeed };
