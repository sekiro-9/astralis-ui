import { forwardRef, type ElementType, type ReactNode, type Ref } from "react";
import type { ListProps } from "./list.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { listVariants, listVariantMap } from "./list.styles";
import { boxVariants, boxVariantMap } from "../../layout/box/box.styles";
import { BOX_VARIANT_KEYS } from "../../layout/box/box";

const VARIANT_KEYS = Object.keys(listVariantMap);

type ListComponent = <T extends ElementType = "ul">(
  props: ListProps<T> & { ref?: Ref<any> },
) => ReactNode;

/** Root of the List compound — renders a `<ul>` (or `<ol>` via `as`). */
const ListRoot = forwardRef(
  <T extends ElementType = "ul">(
    { as, className, children, style, ...props }: ListProps<T>,
    ref: Ref<any>,
  ) => {
    const Element = (as || "ul") as ElementType;

    const [variantProps, boxVariantProps, htmlProps] = splitVariantProps(
      props as Record<string, unknown>,
      VARIANT_KEYS,
      BOX_VARIANT_KEYS,
    );

    const own = resolveStyleProps(variantProps, { maps: listVariantMap, variants: listVariants });
    const box = resolveStyleProps(boxVariantProps, { maps: boxVariantMap, variants: boxVariants });

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
  },
) as unknown as ListComponent;

(ListRoot as any).displayName = "List";
export default ListRoot;
