import { cva } from "class-variance-authority";

/** Shared by CVA (typing + scalar resolution) and, if ever needed, the responsive engine. */
export const kbdVariantMap = {
  size: {
    sm: "astralis:text-2xs astralis:px-1 astralis:min-w-4 astralis:h-4",
    md: "astralis:text-xs astralis:px-1.5 astralis:min-w-5 astralis:h-5",
    lg: "astralis:text-sm astralis:px-2 astralis:min-w-6 astralis:h-6",
  },
} as const;

export const kbdVariants = cva(
  // The heavier bottom border gives the keycap its pressed-key depth.
  "astralis:inline-flex astralis:items-center astralis:justify-center astralis:font-mono astralis:font-medium " +
    "astralis:rounded-md astralis:border-normal astralis:border-b-2 astralis:border-stroke-base " +
    "astralis:bg-surface-subtle astralis:text-label-muted astralis:whitespace-nowrap",
  {
    variants: kbdVariantMap,
    defaultVariants: { size: "md" },
  },
);
