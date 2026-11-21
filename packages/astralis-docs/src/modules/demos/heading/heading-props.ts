import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the heading component's types in astralis-ui. */
export const headingProps: PropRow[] = [
  {
    prop: "as",
    type: `"h1" | "h2" | "h3" | "h4" | "h5" | "h6"`,
    default: `"h2"`,
    description: "Heading level; sets the default size and weight.",
  },
  {
    prop: "size",
    type: `Text sizes | "inherit"`,
    default: `per level`,
    description: "`h1` → `4xl`, `h2` → `3xl`, `h3` → `2xl`, `h4` → `xl`, `h5` → `lg`, `h6` → `md`.",
  },
  {
    prop: "weight",
    type: `Text weights`,
    default: `per level`,
    description: "Bold for h1–h3, semibold for h4–h6.",
  },
  {
    prop: "hover · focusVisible · active",
    type: `{ color, w, h, m*, inset… }`,
    description:
      "Styles for that state, same tokens as the base props: `hover={{ color: \"base\" }}`. A state carries only the props this component takes, so colour and the placement props, not paint or padding.",
  },
];
