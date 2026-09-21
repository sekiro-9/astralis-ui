import type { ElementType } from "react";
import type { ListItemProps } from "./list.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { splitVariantProps } from "../../../utils/split-variant-props";
import { boxVariants, boxVariantMap } from "../../layout/box/box.styles";
import { BOX_VARIANT_KEYS } from "../../layout/box/box.keys";
import { identify } from "../../../utils/dev-identity";

/** A single `<li>`. With `icon`, it suppresses the native marker and renders the icon inline. */
const ListItem = identify("List.Item", function ListItem<T extends ElementType = "li">({
  as,
  className,
  children,
  icon,
  style,
  ref,
  ...props
}: ListItemProps<T>) {
  const Element: ElementType = as ?? "li";
  const [boxProps, htmlProps] = splitVariantProps(props, BOX_VARIANT_KEYS);
  const box = resolveStyleProps(boxProps, { maps: boxVariantMap, variants: boxVariants });

  return (
    <Element
      className={astralisMerge(
        box.className,
        icon != null ? "astralis:list-none astralis:flex astralis:items-start astralis:gap-2" : "",
        className,
      )}
      ref={ref}
      style={{ ...box.style, ...style }}
      {...htmlProps}
    >
      {icon != null && (
        <span className="astralis:inline-flex astralis:shrink-0 astralis:items-center" aria-hidden="true">
          {icon}
        </span>
      )}
      {icon != null ? <span>{children}</span> : children}
    </Element>
  );
});

export default ListItem;
