import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/layout/float/float.types.ts */
export const floatProps: PropRow[] = [
  {
    prop: "placement",
    type: `"top-start" | "top-center" | "top-end" | "middle-start" | "middle-center" | "middle-end" | "bottom-start" | "bottom-center" | "bottom-end"`,
    default: `"top-end"`,
    description: "The edge or corner of the positioned parent to anchor to. Responsive.",
  },
];
