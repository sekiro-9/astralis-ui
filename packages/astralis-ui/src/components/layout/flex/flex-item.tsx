import type { ElementType } from "react";
import type { FlexItemProps } from "./flex.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { flexItemVariants, flexItemVariantMap } from "./flex.style";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";
import { identify } from "../../../utils/dev-identity";

const ITEM_VARIANT_KEYS = Object.keys(flexItemVariantMap);

const FlexItem = identify("Flex.Item", function FlexItem<T extends ElementType = "div">({
  children,
  as,
  className,
  style,
  ref,
  ...props
}: FlexItemProps<T>) {
  const Element: ElementType = as ?? "div";
  const [variantProps, boxProps, htmlProps] = splitVariantProps(props, ITEM_VARIANT_KEYS, BOX_VARIANT_KEYS);

  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });
  const own = resolveStyleProps(variantProps, { maps: flexItemVariantMap, variants: flexItemVariants });

  return (
    <Element
      className={astralisMerge(box.className, own.className, className)}
      style={{ ...box.style, ...own.style, ...style }}
      ref={ref}
      {...htmlProps}
    >
      {children}
    </Element>
  );
});

export default FlexItem;
