import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the list component's types in astralis-ui. */
export const listProps: PropRow[] = [
  {
    prop: "styleType",
    type: `"disc" | "circle" | "square" | "decimal" | "lower-alpha" | "upper-roman" | "none"`,
    default: `"disc"`,
    description: "Marker style; `none` removes marker and indent.",
  },
  {
    prop: "spacing",
    type: `"0" | "1" | "1.5" | "2" | "2.5" | "3" | "4" | "5" | "6" | "8"`,
    default: `"2"`,
    description: "Vertical rhythm between items.",
  },
  {
    prop: "as",
    type: `ElementType`,
    default: `"ul"`,
    description: "Use `\"ol\"` for numbered lists.",
  },
];
