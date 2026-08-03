import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the table component's types in astralis-ui. */
export const tableProps: PropRow[] = [
  {
    prop: "variant",
    type: `"line" | "outline"`,
    default: `"line"`,
    description: "Subtle row dividers, or a bordered box.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Cell padding and text size.",
  },
  {
    prop: "striped",
    type: `boolean`,
    default: `false`,
    description: "Alternate row backgrounds.",
  },
  {
    prop: "interactive",
    type: `boolean`,
    default: `false`,
    description: "Row highlight on hover.",
  },
  {
    prop: "stickyHeader",
    type: `boolean`,
    default: `false`,
    description: "Header pins while the body scrolls.",
  },
];
