import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { boxVariants } from "./box.styles";
import type { Responsive, ResponsiveProp } from "../../../utils/responsive";
import type { whiteSpaceTypes } from "../../../const/common-mappings";
import type {
  RotateToken,
  ScaleToken,
  TranslateToken,
  transformOriginTypes,
  transitionTypes,
} from "../../../const/transform-mappings";
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
  /**
   * Draws the element larger or smaller, in percent (`"105"` is 105%), without
   * moving its neighbours. Takes a state: `hover={{ scale: "105" }}` zooms on
   * hover, `active={{ scale: "95" }}` presses in. Any CSS `scale` value works
   * too (`"1.02"`, `"102%"`); a bare number is a multiplier.
   * @default undefined (100%)
   */
  scale?: ResponsiveProp<ScaleToken | (string & {})>;
  /**
   * Shifts the element sideways from where the layout put it, on the spacing
   * scale (`"2"` is 0.5rem right, `"-2"` left); `"1/2"` and `"full"` are
   * fractions of its own width. Composes with `translateY`, `scale` and
   * `rotate`, and takes a state.
   * @default undefined (no shift)
   */
  translateX?: ResponsiveProp<TranslateToken | (string & {})>;
  /**
   * Shifts the element up or down from where the layout put it, on the
   * spacing scale (`"-1"` lifts it 0.25rem); `"1/2"` and `"full"` are
   * fractions of its own height. `hover={{ translateY: "-1" }}` makes a tile
   * lift on hover.
   * @default undefined (no shift)
   */
  translateY?: ResponsiveProp<TranslateToken | (string & {})>;
  /**
   * Turns the element, in degrees clockwise (`"45"`); negative turns the other
   * way. Any CSS angle works too (`"0.25turn"`). Takes a state.
   * @default undefined (no turn)
   */
  rotate?: ResponsiveProp<RotateToken | (string & {})>;
  /**
   * The point `scale` and `rotate` work around: the centre, a side or a
   * corner (`"top-left"`).
   * @default undefined ("center")
   */
  transformOrigin?: ResponsiveProp<keyof typeof transformOriginTypes>;
  /**
   * Animates changes over the library's standard 200 ms instead of snapping:
   * `transform` for scale, translate and rotate, `colors` for paint, `common`
   * for both plus opacity and shadow (a tile that lifts and deepens its
   * shadow). With reduced motion the change still applies, at once.
   * @default undefined (no transition)
   */
  transition?: ResponsiveProp<keyof typeof transitionTypes>;
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
