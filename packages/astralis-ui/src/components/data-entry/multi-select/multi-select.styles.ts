import { cva } from "class-variance-authority";
import type { MultiSelectSize, MultiSelectVariant } from "./multi-select.types";

const invalidBorder = "astralis:border-error-solid astralis:hover:border-error-solid";

/** The tag-wrapping trigger container. Focus ring is applied separately (React-driven). */
export const msContainer = cva(
  "astralis:w-full astralis:flex astralis:items-center astralis:flex-wrap astralis:gap-1.5 astralis:cursor-text astralis:transition-colors",
  {
    variants: {
      size: {
        sm: "astralis:min-h-8 astralis:px-2 astralis:py-1",
        md: "astralis:min-h-10 astralis:px-3 astralis:py-1.5",
        lg: "astralis:min-h-12 astralis:px-3 astralis:py-2",
      },
      variant: {
        outline: "astralis:border-normal astralis:border-stroke-base astralis:bg-surface-base astralis:rounded-lg astralis:hover:border-stroke-muted",
        filled: "astralis:border-normal astralis:border-transparent astralis:bg-surface-subtle astralis:rounded-lg astralis:hover:bg-surface-muted",
        underline:
          "astralis:border-0 astralis:border-b-2 astralis:border-stroke-base astralis:bg-transparent astralis:rounded-none astralis:px-0 astralis:hover:border-stroke-muted",
        unstyled: "astralis:border-0 astralis:bg-transparent astralis:rounded-none",
      },
      invalid: { true: "", false: "" },
    },
    compoundVariants: [
      { invalid: true, variant: "outline", className: invalidBorder },
      { invalid: true, variant: "filled", className: invalidBorder },
      { invalid: true, variant: "underline", className: invalidBorder },
    ],
    defaultVariants: { size: "md", variant: "outline", invalid: false },
  },
);

/** Focus chrome applied while the inline search input is focused. */
export function msFocusRing(variant: MultiSelectVariant, invalid: boolean): string {
  if (variant === "unstyled") return "";
  if (variant === "underline") return invalid ? "astralis:border-error-solid" : "astralis:border-accent-stroke";
  const bg = variant === "filled" ? "astralis:bg-surface-base " : "";
  if (invalid) return bg + "astralis:border-error-solid astralis:ring-2 astralis:ring-error-muted";
  return bg + "astralis:border-accent-stroke astralis:ring-2 astralis:ring-accent-ring";
}

/** A selected-value chip. Paints from the accent channel. */
export const msTagSizes: Record<MultiSelectSize, string> = {
  sm: "astralis:text-xs astralis:h-5 astralis:px-1.5",
  md: "astralis:text-xs astralis:h-6 astralis:px-2",
  lg: "astralis:text-sm astralis:h-7 astralis:px-2.5",
};

export const msInputText: Record<MultiSelectSize, string> = {
  sm: "astralis:text-xs",
  md: "astralis:text-sm",
  lg: "astralis:text-base",
};
