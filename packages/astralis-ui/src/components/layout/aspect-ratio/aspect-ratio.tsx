import type { ElementType } from "react";
import type { AspectRatioProps } from "./aspect-ratio.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { aspectRatioVariants, aspectRatioVariantMap } from "./aspect-ratio.styles";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";
import { identify } from "../../../utils/dev-identity";

const VARIANT_KEYS = Object.keys(aspectRatioVariantMap);

const AspectRatio = identify("AspectRatio", function AspectRatio<T extends ElementType = "div">({
  children,
  as,
  className,
  style,
  ref,
  ...props
}: AspectRatioProps<T>) {
  const Element: ElementType = as ?? "div";
  const [variantProps, boxProps, htmlProps] = splitVariantProps(props, VARIANT_KEYS, BOX_VARIANT_KEYS);

  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });
  const own = resolveStyleProps(variantProps, { maps: aspectRatioVariantMap, variants: aspectRatioVariants });

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
});

export default AspectRatio;
