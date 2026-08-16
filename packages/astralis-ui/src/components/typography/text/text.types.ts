import type { PlacementProps } from "../../../utils/placement";
import type { VariantProps } from "class-variance-authority";
import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import type { ResponsiveProp, Responsive } from "../../../utils/responsive";
import type { WidenChannelProps } from "../../../const/channel";
import type { textVariants } from "./text.styles";

export type TextSize = NonNullable<VariantProps<typeof textVariants>["size"]>;
export type TextWeight = NonNullable<VariantProps<typeof textVariants>["weight"]>;
export type TextLineClamp = "1" | "2" | "3" | "4" | "5" | "6";

/** Text's typography props with channel widening: `color` is channel-routed
 *  and takes arbitrary CSS values; `size` shares a name with Box's sizing
 *  channel but is a typography rung here — a closed set, hence the skip.
 *  Link composes the same surface. */
export type TextStyleProps = Responsive<
  WidenChannelProps<Omit<VariantProps<typeof textVariants>, "lineClamp">, "size">
>;

interface TextCustomProps<C extends ElementType = "p"> {
  children?: ReactNode;
  as?: C;
  className?: string;
  lineClamp?: ResponsiveProp<TextLineClamp>;
}

type TextBaseProps<C extends ElementType = "p"> = TextCustomProps<C> &
  PlacementProps &
  TextStyleProps;

export type TextProps<C extends ElementType = "p"> = TextBaseProps<C> & 
  Omit<ComponentPropsWithoutRef<C>, keyof TextBaseProps<C>>;