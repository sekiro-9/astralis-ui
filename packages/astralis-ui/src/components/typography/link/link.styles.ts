import { cva } from "class-variance-authority";
import { textVariantMap } from "../text/text.styles";

/**
 * Link's own recipe. Note what is NOT in the base string: the hover colour.
 * That is applied by the component only when the consumer has not set `color`,
 * because an explicit colour should hold in both states rather than being
 * swapped out from under itself on hover.
 */
export const linkVariantMap = {
  variant: {
    underline: "astralis:underline astralis:underline-offset-2",
    hover: "astralis:hover:underline astralis:underline-offset-2",
    plain: "",
  },
} as const;

export const linkVariants = cva(
  "astralis:cursor-pointer astralis:rounded-sm astralis:text-accent-label astralis:transition-colors " +
    "astralis:focus-visible:outline-2 astralis:focus-visible:outline-offset-2 astralis:focus-visible:outline-accent-ring",
  {
    variants: linkVariantMap,
    defaultVariants: { variant: "hover" },
  },
);

/** The colour shift on hover, opted out of when `color` is set explicitly. */
export const linkHoverColor = "astralis:hover:text-accent-solid";

/**
 * Text's token map with NO defaults of its own.
 *
 * Link composes Text's typography vocabulary — the same size/weight/casing
 * scale, one source of truth — but must not inherit Text's `color: "base"`
 * default, which would beat the accent colour on every link in the library.
 * Omitting defaults also means a bare `<Link>` emits no type classes at all,
 * so it keeps inheriting from the paragraph it sits in.
 */
export const linkTypographyVariants = cva("", { variants: textVariantMap });
