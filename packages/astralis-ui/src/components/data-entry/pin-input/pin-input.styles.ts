import { cva } from "class-variance-authority";
import { inputInvalidChrome, inputVariantChrome } from "../input/input.styles";

/** A single PIN cell — square, centred, mono, wearing Input's chrome. */
export const pinCell = cva(
  "astralis:text-center astralis:text-label-base astralis:font-mono astralis:font-semibold " +
    "astralis:transition-colors astralis:outline-none " +
    "astralis:placeholder:text-label-subtle astralis:placeholder:font-normal " +
    "astralis:disabled:cursor-not-allowed astralis:disabled:opacity-moderate",
  {
    variants: {
      size: {
        sm: "astralis:h-8 astralis:w-8 astralis:text-sm",
        md: "astralis:h-10 astralis:w-10 astralis:text-base",
        lg: "astralis:h-12 astralis:w-12 astralis:text-lg",
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
