import type { ElementType } from "react";
import type { ContainerProps } from "./container.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";
import { identify } from "../../../utils/dev-identity";

/**
 * Container centers its content horizontally (`margin-inline: auto`) up to a max
 * width, with default horizontal padding. `maxW` and `px` are Box props with sane
 * defaults — override them like any style prop. `centerContent` stacks children
 * in a centered column.
 */
const Container = identify("Container", function Container<T extends ElementType = "div">({
  as,
  className,
  children,
  centerContent = false,
  maxW = "5xl",
  px = "4",
  style,
  ref,
  ...props
}: ContainerProps<T>) {
  const Element: ElementType = as ?? "div";
  const [boxProps, htmlProps] = splitVariantProps(props, BOX_VARIANT_KEYS);

  // Centering is the `mx: "auto"` default rather than a literal class — a
  // class would sit in a later cascade layer and silently beat a caller's mx.
  const box = resolveStyleProps(
    { w: "full", maxW, px, mx: "auto", ...boxProps },
    { maps: boxVariantMap, variants: boxVariants },
  );

  return (
    <Element
      className={astralisMerge(
        box.className,
        centerContent && "astralis:flex astralis:flex-col astralis:items-center",
        className,
      )}
      ref={ref}
      style={{ ...box.style, ...style }}
      {...htmlProps}
    >
      {children}
    </Element>
  );
});

export default Container;
