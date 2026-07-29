import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { boxVariants } from "./box.styles";
import type { Responsive } from "../../../utils/responsive";
import type { StateProps } from "../../../utils/interaction-state";

interface BoxCustomProps<T extends ElementType = "div"> {
  as?: T;
  children?: ReactNode;
  className?: string;
}

/** Every Box style prop accepts a scalar token or a responsive map. */
export type BoxStyleProps = Responsive<VariantProps<typeof boxVariants>>;

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
