import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with text.types.ts / text.styles.ts */
export const textProps: PropRow[] = [
  {
    prop: "size",
    type: `"xs" – "9xl" (type scale) | "inherit"`,
    default: `"md"`,
    description: "Font size token. `inherit` takes the font size and line height of the parent, for a word set apart inside a sentence.",
  },
  {
    prop: "weight",
    type: `"thin" | "extralight" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black"`,
    description: "Font weight token.",
  },
  {
    prop: "color",
    type: `"base" | "muted" | "subtle" | "inverted" | status tokens | palette shades`,
    description: "Text color from semantic roles or raw palette shades. Left off, the text takes the colour of its parent.",
  },
  {
    prop: "hover · focusVisible · active",
    type: `{ color, w, h, m*, inset… }`,
    description:
      "Styles for that state, same tokens as the base props: `hover={{ color: \"base\" }}`. A state carries only the props this component takes, so colour and the placement props, not paint or padding.",
  },
  {
    prop: "align",
    type: `"left" | "center" | "right" | "justify"`,
    description: "Text alignment.",
  },
  {
    prop: "casing",
    type: `"uppercase" | "lowercase" | "capitalize" | "normal"`,
    description: "Text transform.",
  },
  {
    prop: "lineHeight",
    type: `"none" | "tight" | "snug" | "normal" | "relaxed" | "loose" | "size"`,
    description: "Leading token. `size` is the line height that comes with the size, the default on Text; Heading uses it to step back from its tight default. `size` is a whole value only, not a breakpoint value.",
  },
  {
    prop: "letterSpacing",
    type: `"tighter" | "tight" | "normal" | "wide" | "wider" | "widest"`,
    description: "Tracking token.",
  },
  {
    prop: "fontFamily",
    type: `"heading" | "body" | "sans" | "serif" | "mono"`,
    description: "Font family token.",
  },
  {
    prop: "fontStyle · textDecoration",
    type: `"italic" · "underline" | "line-through" | "overline" | "none"`,
    description: "Style and decoration.",
  },
  {
    prop: "truncate",
    type: "boolean",
    default: "false",
    description: "Single-line ellipsis overflow.",
  },
  {
    prop: "lineClamp",
    type: `"1" – "6"`,
    description: "Multi-line clamp with ellipsis (ignored when truncate is set).",
  },
  {
    prop: "gutterBottom · paragraph",
    type: "boolean",
    default: "false",
    description: "Rhythm helpers: small / paragraph-sized bottom margin (paragraph also forces a <p>).",
  },
  {
    prop: "as",
    type: "ElementType",
    default: `"p"`,
    description: "Rendered element: span, label, figcaption, …",
  },
];
