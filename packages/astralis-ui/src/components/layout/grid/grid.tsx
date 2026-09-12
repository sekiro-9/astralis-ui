import type { ElementType } from "react";
import type { GridProps } from "./grid.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { gridVariants, gridVariantMap } from "./grid.styles";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";

const VARIANT_KEYS = Object.keys(gridVariantMap);

function GridRoot<T extends ElementType = "div">({
  children,
  as,
  className,
  templateColumns,
  templateRows,
  templateAreas,
  style,
  ref,
  ...props
}: GridProps<T>) {
  const Element: ElementType = as ?? "div";
  const [variantProps, boxProps, htmlProps] = splitVariantProps(props, VARIANT_KEYS, BOX_VARIANT_KEYS);

  // Arbitrary track/area templates can't be tokenized, so they ride inline style.
  const templateStyle = {
    ...(templateColumns ? { gridTemplateColumns: templateColumns } : {}),
    ...(templateRows ? { gridTemplateRows: templateRows } : {}),
    ...(templateAreas ? { gridTemplateAreas: templateAreas } : {}),
  };

  // Grid's own recipe FIRST, Box props second — same reason as Flex:
  // `display` is shared, and Grid's cva always emits `grid`.
  const own = resolveStyleProps(variantProps, { maps: gridVariantMap, variants: gridVariants });
  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });

  return (
    <Element
      className={astralisMerge(own.className, box.className, className)}
      ref={ref}
      style={{ ...own.style, ...box.style, ...templateStyle, ...style }}
      {...htmlProps}
    >
      {children}
    </Element>
  );
}

GridRoot.displayName = "Grid";
export default GridRoot;
