import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import type { SelectSize, SelectVariant } from "./select.types";

const invalidChrome =
  "astralis:border-error-solid astralis:hover:border-error-solid astralis:focus-visible:border-error-solid astralis:focus-visible:ring-error-muted";

/** Trigger chrome — mirrors Input's outline/filled/underline/unstyled taxonomy for a button. */
export const selectTrigger = cva(
  "astralis:w-full astralis:flex astralis:items-center astralis:gap-2 astralis:text-left " +
    "astralis:transition-colors astralis:outline-none " +
    "astralis:disabled:cursor-not-allowed astralis:disabled:opacity-moderate",
  {
    variants: {
      size: {
        sm: "astralis:h-8 astralis:px-3 astralis:text-xs",
        md: "astralis:h-10 astralis:px-3 astralis:text-sm",
        lg: "astralis:h-12 astralis:px-4 astralis:text-base",
      },
      variant: {
        outline:
          "astralis:border-normal astralis:border-stroke-base astralis:bg-surface-base astralis:rounded-lg " +
          "astralis:hover:border-stroke-muted " +
          "astralis:focus-visible:border-accent-stroke astralis:focus-visible:ring-2 astralis:focus-visible:ring-accent-ring",
        filled:
          "astralis:border-normal astralis:border-transparent astralis:bg-surface-subtle astralis:rounded-lg " +
          "astralis:hover:bg-surface-muted " +
          "astralis:focus-visible:bg-surface-base astralis:focus-visible:border-accent-stroke astralis:focus-visible:ring-2 astralis:focus-visible:ring-accent-ring",
        underline:
          "astralis:border-0 astralis:border-b-2 astralis:border-stroke-base astralis:bg-transparent astralis:rounded-none astralis:px-0 " +
          "astralis:hover:border-stroke-muted " +
          "astralis:focus-visible:border-accent-stroke",
        unstyled: "astralis:border-0 astralis:bg-transparent astralis:rounded-none",
      },
      invalid: { true: "", false: "" },
    },
    compoundVariants: [
      { invalid: true, variant: "outline", className: invalidChrome },
      { invalid: true, variant: "filled", className: invalidChrome },
      {
        invalid: true,
        variant: "underline",
        className: "astralis:border-error-solid astralis:hover:border-error-solid astralis:focus-visible:border-error-solid",
      },
    ],
    defaultVariants: { size: "md", variant: "outline", invalid: false },
  },
);

/**
 * Where the clear button sits: over a spacer inside the trigger, left of the
 * chevron. It is a sibling of the trigger (a button cannot nest in a button),
 * so it is placed from the trigger's right padding + chevron + gap.
 */
export function selectClearOffset(size: SelectSize, variant: SelectVariant): CSSProperties {
  const padding = variant === "underline" ? 0 : size === "lg" ? 1 : 0.75;
  return { right: `${padding + 1.25}rem` };
}

/** Spacer width reserved inside the trigger for the clear button. */
export const SELECT_CLEAR_SIZE = "1.125rem";
