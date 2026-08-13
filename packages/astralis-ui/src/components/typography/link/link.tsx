import { splitPlacement } from "../../../utils/placement";
import type { ElementType } from "react";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { accentClass } from "../../../const/color-schemes";
import { textVariantMap } from "../text/text.styles";
import { linkAccentColor, linkHoverColor, linkTypographyVariants, linkVariants } from "./link.styles";
import type { LinkProps } from "./link.types";

/** An inline text link: Text's typography, plus accent colouring and external handling. */
export function Link<C extends ElementType = "a">({
  as,
  variant,
  colorScheme = "brand",
  external = false,
  className = "",
  ref,
  children,
  size,
  weight,
  align,
  color,
  casing,
  lineHeight,
  letterSpacing,
  fontFamily,
  fontStyle,
  textDecoration,
  truncate,
  lineClamp,
  ...rest
}: LinkProps<C>) {
  const { placementClass, rest: split } = splitPlacement(rest);
  // splitPlacement folds placement vars under rest.style (user style last).
  const { style, ...domProps } = split as Record<string, any>;

  const Element = (as || "a") as ElementType;
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  // Typography last, so an explicit prop beats the accent label colour.
  const typography = resolveStyleProps(
    {
      size,
      weight,
      align,
      color,
      casing,
      lineHeight,
      letterSpacing,
      fontFamily,
      fontStyle,
      textDecoration,
      truncate,
      lineClamp: truncate ? undefined : lineClamp,
    },
    { maps: textVariantMap, variants: linkTypographyVariants },
  );

  return (
    <Element
      ref={ref}
      className={astralisMerge(
        linkVariants({ variant }),
        // Only paint/shift colour when the colour is ours. With an explicit
        // `color` the resting accent and its hover shift both step aside —
        // the affordance falls to `variant`'s underline.
        color === undefined ? linkAccentColor : "",
        color === undefined ? linkHoverColor : "",
        accentClass(colorScheme),
        typography.className,
        placementClass, className,
      )}
      style={{ ...typography.style, ...style }}
      {...externalProps}
      {...domProps}
    >
      {children}
      {external && (
        <span aria-hidden="true" className="astralis:ml-0.5 astralis:align-super astralis:text-2xs">
          ↗
        </span>
      )}
    </Element>
  );
}

Link.displayName = "Link";
