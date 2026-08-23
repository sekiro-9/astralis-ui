import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { boxVariants } from "./box.styles";
import type { Responsive } from "../../../utils/responsive";
import type { StateProps } from "../../../utils/interaction-state";
import type { WidenChannelProps } from "../../../const/channel";

interface BoxCustomProps<T extends ElementType = "div"> {
  as?: T;
  children?: ReactNode;
  className?: string;
  /**
   * Establishes this element as the query container (`container-type:
   * inline-size`) that descendants' `@sm..@xl` responsive keys resolve
   * against. Without a `container` ancestor, `@`-keyed values are inert.
   */
  container?: boolean;
}

/** Every Box style prop accepts a scalar token or a responsive map. Channel
 *  props additionally take arbitrary CSS values (`p="37px"`) — the widening
 *  keeps token autocomplete. */
export type BoxStyleProps = Responsive<WidenChannelProps<VariantProps<typeof boxVariants>>>;

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
