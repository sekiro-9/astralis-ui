/* ==========================================================================
   ASTRALIS — SPACING VALUE MAPS (var-channel)
   --------------------------------------------------------------------------
   token -> CSS VALUE, not token -> class. Padding/margin are channel props
   (see const/channel.ts): the responsive engine emits one fixed class per
   prop (`astralis-p`, `astralis-p-md`, defined in theme/channels.css) and
   delivers the value below through a custom property on the style attribute.

   Values reference the spacing tokens in theme/tokens/spacing.css so runtime
   theming keeps cascading. Two special cases:
     - "0" has no token variable — it is the literal 0.
     - fractional steps are declared with escaped dots in CSS
       (`--astralis-spacing-0\.5`), so var() references must carry the same
       escape or the declaration parses invalid and silently drops.

   The old class-map version of this file was static literals because the
   Tailwind scanner had to see every class. Values are invisible to CSS
   tooling, so these maps are built programmatically — the token lists below
   are the single source of truth for the vocabulary (and therefore for the
   docs Playground, which reads Object.keys via style-prop-tokens.ts).
   ========================================================================== */

const SPACING_STEPS = [
  "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "6", "7", "8",
  "9", "10", "11", "12", "14", "16", "20", "24", "28", "32", "36", "40", "44",
  "48", "52", "56", "60", "64", "72", "80", "96",
] as const;

export type SpacingToken = "0" | (typeof SPACING_STEPS)[number];
export type MarginToken = SpacingToken | "auto";

import { channelMap } from "./channel";

/** `"0.5"` -> `var(--astralis-spacing-0\.5)` — escape must match spacing.css. */
const spacingVar = (step: string): string =>
  `var(--astralis-spacing-${step.replace(/\./g, "\\.")})`;

const buildSpacing = (): Record<SpacingToken, string> => {
  const map = { "0": "0" } as Record<SpacingToken, string>;
  for (const step of SPACING_STEPS) map[step] = spacingVar(step);
  return map;
};

const SPACING: Record<SpacingToken, string> = channelMap(buildSpacing());
const MARGIN: Record<MarginToken, string> = channelMap({ ...SPACING, auto: "auto" });

// Padding — every map shares the same token -> value table; the channel class
// carries which side/axis the value lands on.
export const pSpacing = SPACING;
export const pySpacing = SPACING;
export const pxSpacing = SPACING;
export const ptSpacing = SPACING;
export const pbSpacing = SPACING;
export const plSpacing = SPACING;
export const prSpacing = SPACING;

// Margin — adds `auto`.
export const mSpacing = MARGIN;
export const mySpacing = MARGIN;
export const mxSpacing = MARGIN;
export const mtSpacing = MARGIN;
export const mbSpacing = MARGIN;
export const mlSpacing = MARGIN;
export const mrSpacing = MARGIN;
