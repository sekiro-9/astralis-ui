import type { ElementType } from "react";
import type { BoxProps } from "./box.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { boxVariants, boxVariantMap } from "./box.styles";
import { BOX_VARIANT_KEYS } from "./box.keys";
import { identify } from "../../../utils/dev-identity";

const Box = identify("Box", function Box<T extends ElementType = "div">({
  children,
  as,
  className,
  style,
  ref,
  ...props
}: BoxProps<T>) {
  const Element: ElementType = as ?? "div";
  const [variantProps, htmlProps] = splitVariantProps(props, BOX_VARIANT_KEYS);
  const resolved = resolveStyleProps(variantProps, { maps: boxVariantMap, variants: boxVariants });

  return (
    <Element
      className={astralisMerge(resolved.className, className)}
      // Channel vars first so the caller's style always wins.
      style={{ ...resolved.style, ...style }}
      ref={ref}
      {...htmlProps}
    >
      {children}
    </Element>
  );
});

export default Box;
