import { cva } from "class-variance-authority";

export const cardRootVariants = cva("astralis:overflow-hidden astralis:transition-all astralis:duration-moderate", {
  variants: {
    variant: {
      elevated: "astralis:bg-surface-base astralis:border-normal astralis:border-stroke-base astralis:shadow-md",
      outline: "astralis:bg-transparent astralis:border-normal astralis:border-stroke-base",
      filled: "astralis:bg-surface-subtle astralis:border-normal astralis:border-transparent",
      unstyled: "",
    },
    size: {
      sm: "astralis:rounded-lg",
      md: "astralis:rounded-xl",
      lg: "astralis:rounded-2xl",
    },
    hoverable: {
      true: "astralis:cursor-pointer astralis:hover:shadow-lg astralis:hover:-translate-y-0.5 astralis:active:scale-95",
      false: "",
    },
  },
  defaultVariants: { variant: "elevated", size: "md", hoverable: false },
});

/**
 * Section padding shared by Header/Body/Footer, resolved by CSS instead of
 * context so the parts stay Server Components: the root stamps
 * `data-card-size` and these parent-keyed variants read it. The md padding is
 * the unprefixed default — a part rendered outside any root keeps the old
 * "silently md" behavior — and the attribute variants out-specify it, so
 * sm/lg win whenever a sized root is above.
 */
export const cardPadding = [
  "astralis:px-5 astralis:py-4",
  "astralis:[[data-card-size=sm]_&]:px-4 astralis:[[data-card-size=sm]_&]:py-3",
  "astralis:[[data-card-size=lg]_&]:px-7 astralis:[[data-card-size=lg]_&]:py-5",
].join(" ");
