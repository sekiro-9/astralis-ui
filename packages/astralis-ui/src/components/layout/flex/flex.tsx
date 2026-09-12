import type { ElementType } from "react";
import type { FlexProps } from "./flex.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { flexVariants, flexVariantMap } from "./flex.style";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";

const VARIANT_KEYS = Object.keys(flexVariantMap);

function FlexRoot<T extends ElementType = "div">({
  children,
  as,
  className,
  style,
  ref,
  ...props
}: FlexProps<T>) {
  const Element: ElementType = as ?? "div";
  const [variantProps, boxProps, htmlProps] = splitVariantProps(props, VARIANT_KEYS, BOX_VARIANT_KEYS);

  // Flex's own recipe FIRST, Box props second. `display` is the one key the
  // two families share and Flex's cva always emits `flex`; merged the other
  // way round it ate an explicit `display={{ base: "hidden", md: "flex" }}`.
  const own = resolveStyleProps(variantProps, { maps: flexVariantMap, variants: flexVariants });
  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });

  return (
    <Element
      className={astralisMerge(own.className, box.className, className)}
      style={{ ...own.style, ...box.style, ...style }}
      ref={ref}
      {...htmlProps}
    >
      {children}
    </Element>
  );
}

FlexRoot.displayName = "Flex";
export default FlexRoot;
