import { forwardRef, type ElementType } from "react";
import type { TextElementType, TextProps } from "./text.types";

const Text = forwardRef<TextElementType[keyof TextElementType], TextProps>(
  (
    {
      children,
      className = "",
      element = "p",
      size, // Optional, will use element-based defaults for headings
      weight, // Optional, will use element-based defaults for b/strong
      align = "left",
    },
    ref
  ) => {
    const baseStyles = "astralis-transition-colors";

    // Font size mappings for explicit size prop
    const sizes = {
      sm: "astralis-text-sm",
      md: "astralis-text-base",
      lg: "astralis-text-lg",
      xl: "astralis-text-xl",
      "2xl": "astralis-text-2xl",
      "3xl": "astralis-text-3xl",
      "4xl": "astralis-text-4xl",
      "5xl": "astralis-text-5xl",
      "6xl": "astralis-text-6xl",
    };

    // Font weight mappings for explicit weight prop
    const weights = {
      thin: "astralis-font-thin",
      extralight: "astralis-font-extralight",
      light: "astralis-font-light",
      normal: "astralis-font-normal",
      medium: "astralis-font-medium",
      semibold: "astralis-font-semibold",
      bold: "astralis-font-bold",
      extrabold: "astralis-font-extrabold",
      black: "astralis-font-black",
    };

    // Alignment mappings
    const aligns = {
      left: "astralis-text-left",
      center: "astralis-text-center",
      right: "astralis-text-right",
      justify: "astralis-text-justify",
    };

    // Element-to-size mappings for headings (based on standard HTML conventions)
    const defaultHeadingSizes: Partial<Record<keyof TextElementType, keyof typeof sizes>> = {
      h1: "4xl", // Larger for h1
      h2: "3xl",
      h3: "2xl",
      h4: "xl",
      h5: "lg",
      h6: "md",
    };

    // Element-to-weight mappings for bold elements
    const defaultWeights: Partial<Record<keyof TextElementType, keyof typeof weights>> = {
      b: "bold",
      strong: "bold",
    };

    const elementMap: Record<keyof TextElementType, ElementType> = {
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      h5: "h5",
      h6: "h6",
      p: "p",
      span: "span",
      strong: "strong",
      b: "b",
      em: "em",
      i: "i",
    };

    const Element = elementMap[element] as ElementType;

    // Determine font size: Use explicit size prop, fallback to default heading size, or default to 'md'
    const fontSizeClass = size
      ? sizes[size]
      : defaultHeadingSizes[element]
      ? sizes[defaultHeadingSizes[element]!]
      : sizes.md;

    // Determine font weight: Use explicit weight prop, fallback to default weight for b/strong, or default to 'normal'
    const fontWeightClass = weight
      ? weights[weight]
      : defaultWeights[element]
      ? weights[defaultWeights[element]!]
      : weights.normal;

    return (
      <Element
        ref={ref}
        className={`${baseStyles} ${fontSizeClass} ${fontWeightClass} ${aligns[align]} ${className}`}
      >
        {children}
      </Element>
    );
  }
);

Text.displayName = "Text";
export default Text;