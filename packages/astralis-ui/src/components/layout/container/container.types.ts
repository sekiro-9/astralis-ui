import type { ElementType } from "react";
import type { BoxProps } from "../box";

interface ContainerCustomProps {
  /** When true, lays children out in a centered column. */
  centerContent?: boolean;
  /**
   * Not a Container prop — use `maxW`.
   *
   * Container has no size recipe, so `size` fell through to Box's, which sets
   * width AND height. `<Container size="lg">` typechecked, rendered, and
   * quietly constrained the height. Narrowing it to `never` turns that wrong
   * guess into a compile error while leaving every other Box prop intact —
   * `Omit<BoxProps<T>, "size">` cannot be used here because omitting across
   * the generic intersection collapses `maxW` and `px` too.
   */
  size?: never;
}

export type ContainerProps<T extends ElementType = "div"> = BoxProps<T> &
  ContainerCustomProps;
