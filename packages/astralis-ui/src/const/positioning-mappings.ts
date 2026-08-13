/* ==========================================================================
   ASTRALIS — POSITIONING VALUE MAPS (var-channel)
   --------------------------------------------------------------------------
   token -> CSS VALUE, not token -> class. inset/top/right/bottom/left are
   channel props (const/channel.ts): fixed class per prop in
   theme/channels.css, value in a custom property.

   Numeric steps ride the spacing scale (offsets track spacing, as Tailwind's
   do); fractions are the literal percentages size.css uses. "0" is literal.
   ========================================================================== */

import { channelMap } from "./channel";

const OFFSET_STEPS = [
  "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "5", "6", "8", "10", "12",
  "16", "20", "24", "32", "40", "48", "56", "64",
] as const;

const OFFSET_FRACTIONS = {
  "1/2": "50%",
  "1/3": "33.333333%",
  "2/3": "66.666667%",
  "1/4": "25%",
  "3/4": "75%",
} as const;

export type OffsetToken =
  | "0"
  | (typeof OFFSET_STEPS)[number]
  | keyof typeof OFFSET_FRACTIONS;

const buildOffsets = (): Record<OffsetToken, string> => {
  const map = { "0": "0", ...OFFSET_FRACTIONS } as Record<OffsetToken, string>;
  for (const step of OFFSET_STEPS) {
    map[step] = `var(--astralis-spacing-${step.replace(/\./g, (c) => `\\${c}`)})`;
  }
  return map;
};

const OFFSETS = channelMap(buildOffsets());

export const insetTypes = OFFSETS;
export const topTypes = OFFSETS;
export const rightTypes = OFFSETS;
export const bottomTypes = OFFSETS;
export const leftTypes = OFFSETS;
