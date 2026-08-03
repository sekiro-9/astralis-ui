import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the card component's types in astralis-ui. */
export const cardProps: PropRow[] = [
  {
    prop: "variant",
    type: `"elevated" | "outline" | "filled" | "unstyled"`,
    default: `"elevated"`,
    description: "Shadowed, bordered, tinted, or bare.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Padding density for all sections.",
  },
  {
    prop: "hoverable",
    type: `boolean`,
    default: `false`,
    description: "Hover elevation.",
  },
];
