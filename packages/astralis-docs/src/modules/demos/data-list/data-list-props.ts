import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the data-list component's types in astralis-ui. */
export const dataListProps: PropRow[] = [
  {
    prop: "orientation",
    type: `"horizontal" | "vertical"`,
    default: `"horizontal"`,
    description: "Label beside or above the value.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Text and rhythm scale.",
  },
];
