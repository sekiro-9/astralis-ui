/**
 * The one breakpoint table. Viewport keys (sm..xl), container keys (@sm..@xl),
 * channels.css and the Tailwind theme all derive from it; scripts/gen-tokens.mjs
 * writes the CSS copies and the token-sync gate fails if they drift.
 *
 * Widths stay literal rem: CSS forbids var() in @media and @container.
 */
export const BREAKPOINTS = ["sm", "md", "lg", "xl"] as const;

export type Breakpoint = (typeof BREAKPOINTS)[number];

export const BREAKPOINT_WIDTHS = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
} as const satisfies Record<Breakpoint, string>;
