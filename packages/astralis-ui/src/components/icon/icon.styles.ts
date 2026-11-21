import { cva } from "class-variance-authority";

/**
 * Token sizes map to our sizing scale (xs 16 → xl 40px). The `[&>svg]` rules let
 * a raw `<svg>` passed as children fill the wrapper, so sizing is uniform whether
 * you pass an icon component via `as` or an inline SVG via children.
 */
export const iconVariants = cva(
  "astralis:inline-block astralis:shrink-0 astralis:[&>svg]:block astralis:[&>svg]:size-full",
  {
    variants: {
      size: {
        xs: "astralis:size-4",
        sm: "astralis:size-5",
        md: "astralis:size-6",
        lg: "astralis:size-8",
        xl: "astralis:size-10",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** The sizing-scale step each token's class above uses, so a responsive size
 *  can carry the same values on the `size` channel. */
export const iconSizeSteps = { xs: "4", sm: "5", md: "6", lg: "8", xl: "10" } as const;
