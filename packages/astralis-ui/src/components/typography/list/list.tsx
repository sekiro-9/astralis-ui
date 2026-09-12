import type { ElementType } from "react";
import type { ListProps } from "./list.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { listVariants, listVariantMap } from "./list.styles";
import { boxVariants, boxVariantMap } from "../../layout/box/box.styles";
import { BOX_VARIANT_KEYS } from "../../layout/box/box.keys";

const VARIANT_KEYS = Object.keys(listVariantMap);

/** Root of the List compound — renders a `<ul>` (or `<ol>` via `as`). */
function ListRoot<T extends ElementType = "ul">({
  as,
  className,
  children,
  style,
  ref,
  ...props
}: ListProps<T>) {
  const Element: ElementType = as ?? "ul";
  const [variantProps, boxProps, htmlProps] = splitVariantProps(props, VARIANT_KEYS, BOX_VARIANT_KEYS);

  const own = resolveStyleProps(variantProps, { maps: listVariantMap, variants: listVariants });
  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });

  return (
    <Element
      className={astralisMerge(own.className, box.className, className)}
      ref={ref}
      style={{ ...own.style, ...box.style, ...style }}
      {...htmlProps}
    >
      {children}
    </Element>
  );
}

ListRoot.displayName = "List";
export default ListRoot;
