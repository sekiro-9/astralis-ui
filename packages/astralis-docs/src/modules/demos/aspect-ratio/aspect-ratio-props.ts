import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/layout/aspect-ratio/aspect-ratio.types.ts */
export const aspectRatioProps: PropRow[] = [
  {
    prop: "ratio",
    type: `"auto" | "square" | "landscape" | "portrait" | "wide" | "ultrawide" | "golden"`,
    default: `"wide"`,
    description: "The frame's width-to-height ratio. Responsive.",
  },
];
