import { cva } from "class-variance-authority";

/**
 * Shared control chrome for `Input` and `Input.TextArea`. Geometry + interaction
 * live here; the focus ring paints from the accent channel (defaults to brand).
 * `invalid` always overrides to red, independent of the accent hue.
 */

const base =
  "astralis:w-full astralis:font-normal astralis:text-label-base astralis:transition-colors " +
  "astralis:outline-none astralis:placeholder:text-label-subtle " +
  "astralis:disabled:cursor-not-allowed astralis:disabled:opacity-moderate astralis:disabled:bg-surface-muted";

const variantChrome = {
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
} as const;

const invalidChrome = {
  outline:
    "astralis:border-error-solid astralis:hover:border-error-solid astralis:focus-visible:border-error-solid astralis:focus-visible:ring-error-muted",
  filled:
    "astralis:border-error-solid astralis:hover:border-error-solid astralis:focus-visible:border-error-solid astralis:focus-visible:ring-error-muted",
  underline:
    "astralis:border-error-solid astralis:hover:border-error-solid astralis:focus-visible:border-error-solid",
  unstyled: "",
} as const;

/** Input (single-line) — fixed heights per size. */
export const inputVariants = cva(base, {
  variants: {
    size: {
      sm: "astralis:h-8 astralis:px-3 astralis:text-xs",
      md: "astralis:h-10 astralis:px-3 astralis:text-sm",
      lg: "astralis:h-12 astralis:px-4 astralis:text-base",
    },
    variant: variantChrome,
    invalid: { true: "", false: "" },
  },
  compoundVariants: [
    { invalid: true, variant: "outline", className: invalidChrome.outline },
    { invalid: true, variant: "filled", className: invalidChrome.filled },
    { invalid: true, variant: "underline", className: invalidChrome.underline },
  ],
  defaultVariants: { size: "md", variant: "outline", invalid: false },
});

/** Textarea — same chrome, but padded vertically and resizable instead of fixed height. */
export const textareaVariants = cva(base + " astralis:resize-y", {
  variants: {
    size: {
      sm: "astralis:px-3 astralis:py-1.5 astralis:text-xs",
      md: "astralis:px-3 astralis:py-2 astralis:text-sm",
      lg: "astralis:px-4 astralis:py-3 astralis:text-base",
    },
    variant: variantChrome,
    invalid: { true: "", false: "" },
  },
  compoundVariants: [
    { invalid: true, variant: "outline", className: invalidChrome.outline },
    { invalid: true, variant: "filled", className: invalidChrome.filled },
    { invalid: true, variant: "underline", className: invalidChrome.underline },
  ],
  defaultVariants: { size: "md", variant: "outline", invalid: false },
});
