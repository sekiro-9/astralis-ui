import { forwardRef, type ElementType, type ReactNode, type Ref } from "react";
import type { GridProps } from "./grid.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { gridVariants } from "./grid.styles";
import { boxVariants } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box";

const VARIANT_KEYS = [
  "columns",
  "rows",
  "flow",
  "autoColumns",
  "autoRows",
  "justifyItems",
  "alignContent",
  "placeContent",
  "placeItems",
  "gap",
  "rowGap",
  "columnGap",
];

type GridComponent = <T extends ElementType = "div">(
  props: GridProps<T> & { ref?: Ref<any> },
) => ReactNode;

const GridRoot = forwardRef(
  <T extends ElementType = "div">(
    { children, as, className, ...props }: GridProps<T>,
    ref: Ref<any>,
  ) => {
    const Element = (as || "div") as ElementType;

    const variantProps: Record<string, any> = {};
    const boxVariantProps: Record<string, any> = {};
    const htmlProps: Record<string, any> = {};

    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        if (VARIANT_KEYS.includes(key)) {
          variantProps[key] = (props as any)[key];
        } else if (BOX_VARIANT_KEYS.includes(key)) {
          boxVariantProps[key] = (props as any)[key];
        } else {
          htmlProps[key] = (props as any)[key];
        }
      }
    }

    return (
      <Element
        className={astralisMerge(
          boxVariants(boxVariantProps),
          gridVariants(variantProps),
          className,
        )}
        ref={ref}
        {...htmlProps}
      >
        {children}
      </Element>
    );
  },
) as unknown as GridComponent;

(GridRoot as any).displayName = "Grid";
export default GridRoot;