import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the kbd component's types in astralis-ui. */
export const kbdProps: PropRow[] = [
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Cap size.",
  },
];
