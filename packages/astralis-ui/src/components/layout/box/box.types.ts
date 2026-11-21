import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { boxVariants } from "./box.styles";
import type { Responsive, ResponsiveProp } from "../../../utils/responsive";
import type { whiteSpaceTypes } from "../../../const/common-mappings";
import type { StateProps } from "../../../utils/interaction-state";
import type { WidenChannelProps } from "../../../const/channel";
import type { AliasesOf } from "../../../const/prop-aliases";
import type { PolymorphicRef } from "../../../types";
import type { ColorScheme } from "../../../const/color-schemes";

interface BoxCustomProps<T extends ElementType = "div"> {
  as?: T;
  ref?: PolymorphicRef<T>;
  children?: ReactNode;
  className?: string;
  /**
   * Establishes this element as the query container (`container-type:
   * inline-size`) that descendants' `@sm..@xl` responsive keys resolve
   * against. Without a `container` ancestor, `@`-keyed values are inert.
   */
  container?: boolean;
  /**
   * Sets the accent hue for everything inside: a component given
   * `colorScheme="inherit"`, and any part that paints with the accent and sets
   * no scheme of its own, takes this one. Paints nothing on the element itself.
   */
  colorScheme?: ColorScheme;
  /**
   * How spaces and line breaks in the text inside are kept (`white-space`):
   * `nowrap` keeps a row of labels on one line, `pre-wrap` keeps the text's
   * own line breaks. Inherited by the text inside.
   * @default undefined (inherited, `normal`)
   */
  whiteSpace?: ResponsiveProp<keyof typeof whiteSpaceTypes>;
}

/** Every Box style prop accepts a scalar token or a responsive map. Channel
 *  props additionally take arbitrary CSS values (`p="37px"`) — the widening
 *  keeps token autocomplete. */
type BoxShortStyleProps = Responsive<WidenChannelProps<VariantProps<typeof boxVariants>>>;

/** The short forms plus their long spellings — `padding` works wherever `p`
 *  does. `normalizeAliases` folds the long forms away before resolution. */
export type BoxStyleProps = BoxShortStyleProps & AliasesOf<BoxShortStyleProps>;

/**
 * `hover` / `focusVisible` / `active`, each taking a state object limited to
 * the properties that paint — so a state style the precompiled CSS does not
 * carry is a compile error rather than a class that silently does nothing.
 */
export type BoxStateProps = StateProps;

type BoxBaseProps<T extends ElementType = "div"> = BoxCustomProps<T> &
  BoxStyleProps &
  BoxStateProps;

export type BoxProps<T extends ElementType = "div"> = BoxBaseProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof BoxBaseProps<T>>;
