import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the separator component's types in astralis-ui. */
export const separatorProps: PropRow[] = [
  {
    prop: "orientation",
    type: `"horizontal" | "vertical"`,
    default: `"horizontal"`,
    description: "Line direction; also sets `aria-orientation`.",
  },
  {
    prop: "variant",
    type: `"solid" | "dashed" | "dotted"`,
    default: `"solid"`,
    description: "Line style.",
  },
];
