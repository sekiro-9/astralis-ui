import type { ElementType } from "react";
import type { GridProps, GridTemplate } from "./grid.types";
import { BREAKPOINTS } from "../../../const/breakpoints";
import { CONTAINER_BREAKPOINT_WIDTHS, channelClass, channelVar, containerSuffix } from "../../../const/channel";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { gridVariants, gridVariantMap } from "./grid.styles";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";
import { identify } from "../../../utils/dev-identity";

const VARIANT_KEYS = Object.keys(gridVariantMap);

const TEMPLATES = {
  templateColumns: { slug: "template-columns", property: "gridTemplateColumns" },
  templateRows: { slug: "template-rows", property: "gridTemplateRows" },
  templateAreas: { slug: "template-areas", property: "gridTemplateAreas" },
} as const;

const BREAKPOINT_KEYS = new Set<string>(BREAKPOINTS);
const CONTAINER_KEYS = new Set<string>(Object.keys(CONTAINER_BREAKPOINT_WIDTHS));

/** Arbitrary track and area templates can't be tokens or classes. A string
 *  rides inline style; a breakpoint map rides one variable per key, read by
 *  the per-breakpoint rules in grid.css (inline style could not change
 *  with the viewport). */
function resolveTemplates(values: Record<keyof typeof TEMPLATES, GridTemplate | undefined>) {
  const classes: string[] = [];
  const style: Record<string, string> = {};
  for (const prop of Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]) {
    const value = values[prop];
    const { slug, property } = TEMPLATES[prop];
    if (typeof value === "string") {
      if (value) style[property] = value;
      continue;
    }
    if (typeof value !== "object" || value === null) continue;
    for (const [key, css] of Object.entries(value)) {
      if (typeof css !== "string" || css === "") continue;
      const suffix = key === "base" ? undefined
        : BREAKPOINT_KEYS.has(key) ? key
        : CONTAINER_KEYS.has(key) ? containerSuffix(key)
        : null;
      if (suffix === null) continue;
      classes.push(channelClass(slug, suffix));
      style[channelVar(slug, suffix)] = css;
    }
  }
  return { className: classes.join(" "), style };
}

const GridRoot = identify("Grid", function GridRoot<T extends ElementType = "div">({
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

  const templates = resolveTemplates({ templateColumns, templateRows, templateAreas });

  // Grid's own recipe FIRST, Box props second — same reason as Flex:
  // `display` is shared, and Grid's cva always emits `grid`.
  const own = resolveStyleProps(variantProps, { maps: gridVariantMap, variants: gridVariants });
  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });

  return (
    <Element
      className={astralisMerge(own.className, box.className, templates.className, className)}
      ref={ref}
      style={{ ...own.style, ...box.style, ...templates.style, ...style }}
      {...htmlProps}
    >
      {children}
    </Element>
  );
});

export default GridRoot;
