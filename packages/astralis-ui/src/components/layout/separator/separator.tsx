import type { ElementType } from "react";
import type { SeparatorProps } from "./separator.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { separatorVariants, separatorVariantMap } from "./separator.styles";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";

const VARIANT_KEYS = Object.keys(separatorVariantMap);

function Separator<T extends ElementType = "div">({
  as,
  className,
  style,
  ref,
  ...props
}: SeparatorProps<T>) {
  const Element: ElementType = as ?? "div";
  const [variantProps, boxProps, htmlProps] = splitVariantProps(props, VARIANT_KEYS, BOX_VARIANT_KEYS);

  // Scalar orientation drives aria-orientation; a responsive value leaves it unset.
  const orientation = variantProps.orientation ?? "horizontal";
  const ariaOrientation = typeof orientation === "string" ? orientation : undefined;

  const own = resolveStyleProps(variantProps, { maps: separatorVariantMap, variants: separatorVariants });
  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });

  return (
    <Element
      role="separator"
      aria-orientation={ariaOrientation}
      className={astralisMerge(own.className, box.className, className)}
      ref={ref}
      style={{ ...own.style, ...box.style, ...style }}
      {...htmlProps}
    />
  );
}

Separator.displayName = "Separator";
export default Separator;
