import type { PlacementProps, PlacementPropName } from "../../../utils/placement";
import type { StatePropName, StateStyles } from "../../../utils/interaction-state";
import type { VariantProps } from "class-variance-authority";
import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import type { ResponsiveProp, Responsive } from "../../../utils/responsive";
import type { WidenChannelProps } from "../../../const/channel";
import type { PolymorphicRef } from "../../../types";
import type { textVariants } from "./text.styles";

export type TextSize = NonNullable<VariantProps<typeof textVariants>["size"]>;
export type TextWeight = NonNullable<VariantProps<typeof textVariants>["weight"]>;
export type TextLineClamp = "1" | "2" | "3" | "4" | "5" | "6";

/** Text's typography props with channel widening: `color` is channel-routed
 *  and takes arbitrary CSS values; `size` shares a name with Box's sizing
 *  channel but is a typography rung here — a closed set, hence the skip.
 *  Link composes the same surface. */
export type TextStyleProps = Responsive<
  WidenChannelProps<
    Omit<VariantProps<typeof textVariants>, "lineClamp" | "lineHeight" | "textWrap" | "whiteSpace" | "numeric">,
    "size"
  >
> &
  TextFlowProps;

type TextVariantValue<K extends keyof VariantProps<typeof textVariants>> = NonNullable<VariantProps<typeof textVariants>[K]>;

export type TextLineHeight = TextVariantValue<"lineHeight">;
export type TextWrap = TextVariantValue<"textWrap">;
export type TextWhiteSpace = TextVariantValue<"whiteSpace">;
export type TextNumeric = TextVariantValue<"numeric">;

/** Line height and how text wraps, breaks and sets its figures. */
interface TextFlowProps {
  /**
   * Line height, as a multiple of the font size. `"size"` keeps the line
   * height that comes with `size` (Heading otherwise uses `"tight"`). `"size"`
   * is a whole value only, not a breakpoint value: after another line height
   * it could not restore the size's own.
   * @default undefined (the size's own; "tight" on Heading)
   */
  lineHeight?: ResponsiveProp<Exclude<TextLineHeight, "size">> | "size";
  /**
   * How lines break (`text-wrap`): `balance` evens out the lines of a short
   * title, `pretty` avoids a lone last word in a paragraph, `nowrap` keeps
   * one line.
   * @default undefined (the browser's `wrap`)
   */
  textWrap?: ResponsiveProp<TextWrap>;
  /**
   * How spaces and line breaks in the text are kept (`white-space`):
   * `nowrap` keeps one line, `pre-wrap` keeps the text's own line breaks.
   * @default undefined (inherited, `normal`)
   */
  whiteSpace?: ResponsiveProp<TextWhiteSpace>;
  /**
   * Figure style (`font-variant-numeric`): `tabular` gives every digit the
   * same width, so counts and prices line up and do not shift as they change.
   * @default undefined (inherited, the font's own figures)
   */
  numeric?: ResponsiveProp<TextNumeric>;
}

/** What a Text state may carry: the stateable props Text takes itself, its
 *  `color` and the channel placement props. Paint and padding stay off, as
 *  they do on the base props. */
export type TextStateStyles = Pick<StateStyles, Extract<keyof StateStyles, "color" | PlacementPropName>>;

/** `hover` / `focusVisible` / `active` on Text, Heading and Link. */
export type TextStateProps = { [K in StatePropName]?: TextStateStyles };

interface TextCustomProps<C extends ElementType = "p"> {
  children?: ReactNode;
  as?: C;
  ref?: PolymorphicRef<C>;
  className?: string;
  lineClamp?: ResponsiveProp<TextLineClamp>;
}

type TextBaseProps<C extends ElementType = "p"> = TextCustomProps<C> &
  PlacementProps &
  TextStyleProps &
  TextStateProps;

export type TextProps<C extends ElementType = "p"> = TextBaseProps<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof TextBaseProps<C>>;