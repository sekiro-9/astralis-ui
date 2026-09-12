import { splitPlacement } from "../../../utils/placement";
import type { CSSProperties, ElementType } from "react";
import type { TextProps, TextSize, TextWeight } from "./text.types";
import { astralisMerge } from "../../../utils/astralis-merge";
import { resolveStyleProps } from "../../../utils/responsive";
import { textVariants, textVariantMap } from "./text.styles";

const DEFAULT_HEADING_SIZES: Record<string, TextSize> = {
  h1: "4xl",
  h2: "3xl",
  h3: "2xl",
  h4: "xl",
  h5: "lg",
  h6: "md",
};

const DEFAULT_WEIGHTS: Record<string, TextWeight> = {
  h1: "bold",
  h2: "bold",
  h3: "bold",
  h4: "semibold",
  h5: "semibold",
  h6: "semibold",
  b: "bold",
  strong: "bold",
};

function Text<C extends ElementType = "p">({
  children,
  as,
  ref,
  className = "",
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
  gutterBottom = false,
  paragraph = false,
  truncate = false,
  lineClamp,
  ...props
}: TextProps<C>) {
  const Element: ElementType = paragraph ? "p" : (as ?? "p");
  const elementStr = typeof Element === "string" ? Element : "";

  const { placementClass, rest } = splitPlacement(props);
  // splitPlacement already folded placement vars under rest.style (user style
  // last) — pull it out so the typography channel vars can slot in first.
  const { style, ...domProps } = rest as Record<string, unknown> & { style?: CSSProperties };

  const typography = resolveStyleProps(
    {
      size: size || DEFAULT_HEADING_SIZES[elementStr] || "md",
      weight: weight || DEFAULT_WEIGHTS[elementStr] || "normal",
      align,
      color,
      casing,
      lineHeight,
      letterSpacing,
      fontFamily,
      fontStyle,
      textDecoration,
      gutterBottom,
      paragraph,
      truncate,
      lineClamp: truncate ? undefined : lineClamp,
    },
    { maps: textVariantMap, variants: textVariants },
  );

  return (
    <Element
      className={astralisMerge(typography.className, placementClass, className)}
      ref={ref}
      style={{ ...typography.style, ...style }}
      {...domProps}
    >
      {children}
    </Element>
  );
}

Text.displayName = "Text";
export default Text;
