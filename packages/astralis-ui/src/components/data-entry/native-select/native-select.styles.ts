import { cva } from "class-variance-authority";

/** Field chrome for the raw `<select>` — mirrors Input's outline/filled taxonomy. */
export const nativeSelectField = cva(
  "astralis:w-full astralis:appearance-none astralis:pr-9 astralis:transition-colors astralis:outline-none " +
    "astralis:text-label-base astralis:cursor-pointer " +
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
      },
      invalid: { true: "", false: "" },
    },
    compoundVariants: [
      {
        invalid: true,
        variant: "outline",
        className:
          "astralis:border-error-solid astralis:hover:border-error-solid astralis:focus-visible:border-error-solid astralis:focus-visible:ring-error-muted",
      },
      {
        invalid: true,
        variant: "filled",
        className:
          "astralis:border-error-solid astralis:hover:border-error-solid astralis:focus-visible:border-error-solid astralis:focus-visible:ring-error-muted",
      },
    ],
    defaultVariants: { size: "md", variant: "outline", invalid: false },
  },
);

/** The decorative chevron overlaid on the field's right edge. */
export const nativeSelectChevron =
  "astralis:pointer-events-none astralis:absolute astralis:right-3 astralis:top-1/2 astralis:-translate-y-1/2 " +
  "astralis:size-4 astralis:text-label-subtle";
