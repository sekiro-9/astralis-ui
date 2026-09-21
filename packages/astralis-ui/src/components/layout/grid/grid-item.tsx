import type { ElementType } from "react";
import type { GridItemProps } from "./grid.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { gridItemVariants, gridItemVariantMap } from "./grid.styles";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";
import { identify } from "../../../utils/dev-identity";

const ITEM_VARIANT_KEYS = Object.keys(gridItemVariantMap);

const GridItem = identify("Grid.Item", function GridItem<T extends ElementType = "div">({
  children,
  as,
  className,
  area,
  style,
  ref,
  ...props
}: GridItemProps<T>) {
  const Element: ElementType = as ?? "div";
  const [variantProps, boxProps, htmlProps] = splitVariantProps(props, ITEM_VARIANT_KEYS, BOX_VARIANT_KEYS);

  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });
  const own = resolveStyleProps(variantProps, { maps: gridItemVariantMap, variants: gridItemVariants });

  return (
    <Element
      className={astralisMerge(box.className, own.className, className)}
      ref={ref}
      style={{ ...box.style, ...own.style, ...(area ? { gridArea: area } : {}), ...style }}
      {...htmlProps}
    >
      {children}
    </Element>
  );
});

export default GridItem;
