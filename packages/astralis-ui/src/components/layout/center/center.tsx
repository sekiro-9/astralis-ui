import type { ElementType } from "react";
import type { CenterProps } from "./center.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { boxVariants, boxVariantMap } from "../box/box.styles";
import { BOX_VARIANT_KEYS } from "../box/box.keys";
import { identify } from "../../../utils/dev-identity";

/** Centers its children on both axes (flex + items/justify center). Carries all Box props. */
const Center = identify("Center", function Center<T extends ElementType = "div">({
  as,
  className,
  children,
  style,
  ref,
  ...props
}: CenterProps<T>) {
  const Element: ElementType = as ?? "div";
  const [boxProps, htmlProps] = splitVariantProps(props, BOX_VARIANT_KEYS);
  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });

  return (
    <Element
      className={astralisMerge(
        box.className,
        "astralis:flex astralis:items-center astralis:justify-center",
        className,
      )}
      ref={ref}
      style={{ ...box.style, ...style }}
      {...htmlProps}
    >
      {children}
    </Element>
  );
});

export default Center;
