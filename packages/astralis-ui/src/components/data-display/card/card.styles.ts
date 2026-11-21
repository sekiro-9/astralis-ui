import { cva } from "class-variance-authority";

/* `overflow-clip`, not `hidden`: it still rounds off media at the corners,
   but a clip is not a scroll container, so a `reveal` inside the card follows
   the page instead of a box that never scrolls. A clip also starts no block
   formatting context, so `unstyled`, the one variant with no border to hold
   them, gets `flow-root` to keep its children's margins inside. */
export const cardRootVariants = cva("astralis:overflow-clip astralis:transition-all astralis:duration-moderate", {
  variants: {
    variant: {
      elevated: "astralis:bg-surface-base astralis:border-normal astralis:border-stroke-base astralis:shadow-md",
      outline: "astralis:bg-transparent astralis:border-normal astralis:border-stroke-base",
      filled: "astralis:bg-surface-subtle astralis:border-normal astralis:border-transparent",
      unstyled: "astralis:flow-root",
    },
    size: {
      sm: "astralis:rounded-lg",
      md: "astralis:rounded-xl",
      lg: "astralis:rounded-2xl",
    },
    hoverable: {
      // The lift and the press move the card, so they wait for motion-safe;
      // the shadow (and the border, below) still answer the pointer under
      // reduced motion.
      true:
        "astralis:cursor-pointer astralis:hover:shadow-xl " +
        "astralis:motion-safe:hover:-translate-y-1 astralis:motion-safe:active:scale-95",
      false: "",
    },
  },
  // A shadow barely shows on a dark surface, so the bordered variants also
  // firm up their border.
  compoundVariants: [
    { hoverable: true, variant: ["elevated", "outline"], class: "astralis:hover:border-stroke-muted" },
  ],
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
