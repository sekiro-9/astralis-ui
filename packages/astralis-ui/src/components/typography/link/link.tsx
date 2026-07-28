import type { ElementType } from "react";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { accentClass } from "../../../const/color-schemes";
import { textVariantMap } from "../text/text.styles";
import { linkHoverColor, linkTypographyVariants, linkVariants } from "./link.styles";
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
  const Element = (as || "a") as ElementType;
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Element
      ref={ref}
      className={astralisMerge(
        linkVariants({ variant }),
        // Only shift colour on hover when the colour is ours to shift. With an
        // explicit `color` the affordance falls to `variant`'s underline.
        color === undefined ? linkHoverColor : "",
        accentClass(colorScheme),
        // Typography last, so an explicit prop beats the accent label colour.
        resolveStyleProps(
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
        ),
        className,
      )}
      {...externalProps}
      {...rest}
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
