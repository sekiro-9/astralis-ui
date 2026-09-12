import type { ElementType } from "react";
import type { FloatProps } from "./float.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { floatVariants, floatVariantMap } from "./float.styles";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";

const VARIANT_KEYS = Object.keys(floatVariantMap);

/**
 * Float positions its content at the edge/corner of the nearest positioned
 * ancestor — wrap it in a `position="relative"` Box. Ideal for badges, dots,
 * and close buttons overlaid on a container.
 */
function Float<T extends ElementType = "div">({
  children,
  as,
  className,
  style,
  ref,
  ...props
}: FloatProps<T>) {
  const Element: ElementType = as ?? "div";
  const [variantProps, boxProps, htmlProps] = splitVariantProps(props, VARIANT_KEYS, BOX_VARIANT_KEYS);

  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });
  const own = resolveStyleProps(variantProps, { maps: floatVariantMap, variants: floatVariants });

  return (
    <Element
      className={astralisMerge(box.className, own.className, className)}
      ref={ref}
      style={{ ...box.style, ...own.style, ...style }}
      {...htmlProps}
    >
      {children}
    </Element>
  );
}

Float.displayName = "Float";
export default Float;
