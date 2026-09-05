import { cva } from "class-variance-authority";
import { inputInvalidChrome, inputVariantChrome } from "../input/input.styles";

/** Field chrome for the raw `<select>` — the same variant set as Input. */
export const nativeSelectField = cva(
  "astralis:w-full astralis:appearance-none astralis:transition-colors astralis:outline-none " +
    "astralis:text-label-base astralis:cursor-pointer " +
    "astralis:disabled:cursor-not-allowed astralis:disabled:opacity-moderate",
  {
    variants: {
      size: {
        sm: "astralis:h-8 astralis:px-3 astralis:text-xs",
        md: "astralis:h-10 astralis:px-3 astralis:text-sm",
        lg: "astralis:h-12 astralis:px-4 astralis:text-base",
      },
      variant: inputVariantChrome,
      invalid: { true: "", false: "" },
    },
    compoundVariants: [
      { invalid: true, variant: "outline", className: inputInvalidChrome.outline },
      { invalid: true, variant: "filled", className: inputInvalidChrome.filled },
      { invalid: true, variant: "underline", className: inputInvalidChrome.underline },
    ],
    defaultVariants: { size: "md", variant: "outline", invalid: false },
  },
);

/** Room for the chevron. Applied after the recipe so `underline`'s `px-0` cannot remove it. */
export const nativeSelectChevronGutter = "astralis:pr-9";

/** The decorative chevron overlaid on the field's right edge; centred vertically by inline style. */
export const nativeSelectChevron =
  "astralis:pointer-events-none astralis:absolute astralis:right-3 astralis:size-4 astralis:text-label-subtle";
