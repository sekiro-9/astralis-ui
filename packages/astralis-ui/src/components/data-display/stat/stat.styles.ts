import { cva } from "class-variance-authority";
import { alignItemsTypes } from "../../../const/layout-mappings";

/**
 * One scale, three parts. The value used to be pinned at `text-3xl`, which
 * made Stat unusable in a marketing band (numbers too small) and cramped in a
 * dense table (too big) — the only escape was a `className` override, which is
 * exactly the leak the style-prop system exists to prevent.
 *
 * Label and help text move with the value so a resized Stat stays in
 * proportion rather than growing one line and leaving the others behind.
 *
 * Each map is exported as `*Map` and lives in a `.styles.ts` file because
 * that's what the safelist generator scans — without both, `size={{ base:
 * "lg", lg: "xl" }}` would emit a breakpoint class Tailwind never compiled.
 */
export const statLabelSizeMap = {
  sm: "astralis:text-xs",
  md: "astralis:text-sm",
  lg: "astralis:text-sm",
  xl: "astralis:text-base",
} as const;

export const statValueSizeMap = {
  sm: "astralis:text-xl",
  md: "astralis:text-3xl",
  lg: "astralis:text-4xl",
  xl: "astralis:text-5xl",
} as const;

/** Help text and the trend indicator share a rung — they sit on one line. */
export const statHelpSizeMap = {
  sm: "astralis:text-xs",
  md: "astralis:text-sm",
  lg: "astralis:text-sm",
  xl: "astralis:text-base",
} as const;

export const statAlignMap = {
  start: "astralis:items-start",
  center: "astralis:items-center",
  end: "astralis:items-end",
} satisfies Partial<typeof alignItemsTypes>;

export const statRootVariants = cva("astralis:flex astralis:flex-col astralis:gap-1", {
  variants: { align: statAlignMap },
  defaultVariants: { align: "start" },
});

export const statLabelVariants = cva("astralis:font-medium astralis:text-label-muted", {
  variants: { size: statLabelSizeMap },
  defaultVariants: { size: "md" },
});

export const statValueVariants = cva(
  "astralis:font-semibold astralis:text-label-base astralis:tabular-nums",
  {
    variants: { size: statValueSizeMap },
    defaultVariants: { size: "md" },
  },
);

export const statHelpVariants = cva("astralis:text-label-muted", {
  variants: { size: statHelpSizeMap },
  defaultVariants: { size: "md" },
});

export const statIndicatorVariants = cva(
  "astralis:inline-flex astralis:items-center astralis:gap-1 astralis:font-medium",
  {
    variants: { size: statHelpSizeMap },
    defaultVariants: { size: "md" },
  },
);
