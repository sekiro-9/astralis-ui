import { forwardRef, type ElementType, type ReactNode, type Ref } from "react";
import type { BoxProps } from "./box.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { STATE_PROP_NAMES } from "../../../utils/interaction-state";
import { boxVariants, boxVariantMap } from "./box.styles";

/**
 * Derived from the token map so the runtime split can never drift from the
 * styles. The interaction-state props ride along: every Box-composing
 * primitive already routes these keys into `resolveStyleProps`, which resolves
 * both layers — so states work everywhere from one place, and `hover` can
 * never leak onto the DOM as an attribute.
 */
export const BOX_VARIANT_KEYS = [...Object.keys(boxVariantMap), ...STATE_PROP_NAMES];

type BoxComponent = <T extends ElementType = "div">(
  props: BoxProps<T> & { ref?: Ref<any> },
) => ReactNode;

const Box = forwardRef(
  <T extends ElementType = "div">(
    { children, as, className, ...props }: BoxProps<T>,
    ref: Ref<any>,
  ) => {
    const Element = (as || "div") as ElementType;

    const variantProps: Record<string, any> = {};
    const htmlProps: Record<string, any> = {};

    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        if (BOX_VARIANT_KEYS.includes(key)) {
          variantProps[key] = (props as any)[key];
        } else {
          htmlProps[key] = (props as any)[key];
        }
      }
    }

    return (
      <Element
        className={astralisMerge(
          resolveStyleProps(variantProps, { maps: boxVariantMap, variants: boxVariants }),
          className,
        )}
        ref={ref}
        {...htmlProps}
      >
        {children}
      </Element>
    );
  },
) as unknown as BoxComponent;

(Box as any).displayName = "Box";
export default Box;
