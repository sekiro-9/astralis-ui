import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode, Ref } from "react";
import type { ColorScheme } from "../../../const/color-schemes";
import type { ResponsiveProp } from "../../../utils/responsive";
import type { PlacementProps } from "../../../utils/placement";
import type { TextLineClamp, TextStyleProps } from "../text/text.types";
import type { linkVariants } from "./link.styles";

export type LinkVariant = NonNullable<VariantProps<typeof linkVariants>["variant"]>;

interface LinkCustomProps<C extends ElementType = "a"> {
  /** Render as a router link component (e.g. Next's `Link`). */
  as?: C;
  /** Hue (via the accent channel). @default "brand" */
  colorScheme?: ColorScheme;
  /** Opens in a new tab with `rel="noopener noreferrer"` and an ↗ marker. */
  external?: boolean;
  className?: string;
  /** React 19: ref is a regular prop — no forwardRef, no polymorphic cast. */
  ref?: Ref<HTMLElement>;
  children: ReactNode;
  lineClamp?: ResponsiveProp<TextLineClamp>;
}

/**
 * A link is text with special highlighting, so it takes Text's typography props
 * — `size`, `weight`, `color`, `casing`, and the rest — on top of its own
 * recipe. Unlike Text it defaults none of them: an unstyled link inherits from
 * whatever it sits inside, which is what an inline link should do.
 */
// `variant` is a recipe choice, not a style token, so it stays scalar — the
// typography props are the responsive half.
type LinkBaseProps<C extends ElementType = "a"> = LinkCustomProps<C> &
  VariantProps<typeof linkVariants> &
  PlacementProps &
  TextStyleProps;

export type LinkProps<C extends ElementType = "a"> = LinkBaseProps<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof LinkBaseProps<C>>;
