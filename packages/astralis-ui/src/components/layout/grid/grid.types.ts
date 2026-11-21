import type { VariantProps } from "class-variance-authority";
import type { gridVariants, gridItemVariants } from "./grid.styles";
import type { ElementType } from "react";
import type { BoxProps } from "../box";
import type { Responsive, ResponsiveProp } from "../../../utils/responsive";
import type { WidenChannelProps } from "../../../const/channel";

/** A raw CSS template value, or one per breakpoint: `{ base: "1fr", lg: "minmax(0, 1fr) 18rem" }`.
 *  Container keys (`@md`) follow the nearest `container` ancestor. */
export type GridTemplate = ResponsiveProp<string>;

/** Grid container layout props — each accepts a scalar token or a responsive
 *  map; the gap family also takes arbitrary CSS values. */
type GridCustomProps = Responsive<WidenChannelProps<VariantProps<typeof gridVariants>>> & {
  /** Raw `grid-template-columns` for arbitrary tracks, e.g. `"200px 1fr"`, or a
   *  breakpoint map of them. Beats `columns`.
   *  @default undefined */
  templateColumns?: GridTemplate;
  /** Raw `grid-template-rows` for arbitrary tracks, or a breakpoint map of them. Beats `rows`.
   *  @default undefined */
  templateRows?: GridTemplate;
  /** Raw `grid-template-areas`, e.g. `'"head head" "nav main"'`, or a breakpoint map of them.
   *  @default undefined */
  templateAreas?: GridTemplate;
};

/** Grid item placement props — each responsive; `order` also takes arbitrary
 *  CSS values (spans/lines stay closed sets — they are keyword classes). */
type GridItemCustomProps = Responsive<WidenChannelProps<VariantProps<typeof gridItemVariants>>> & {
  /** Named grid area (`grid-area`) matching a Grid `templateAreas` cell. */
  area?: string;
};

export type GridItemProps<T extends ElementType = "div"> = BoxProps<T> & GridItemCustomProps;
export type GridProps<T extends ElementType = "div"> = BoxProps<T> & GridCustomProps;
