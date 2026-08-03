import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the tooltip component's types in astralis-ui. */
export const tooltipProps: PropRow[] = [
  {
    prop: "side",
    type: `"top" | "right" | "bottom" | "left"`,
    default: `"top"`,
    description: "Preferred placement; flips on collision.",
  },
  {
    prop: "align",
    type: `"start" | "center" | "end"`,
    default: `"center"`,
    description: "Alignment along the side.",
  },
  {
    prop: "sideOffset",
    type: `number`,
    default: `6`,
    description: "Gap from the trigger, in pixels.",
  },
  {
    prop: "delay",
    type: `number`,
    default: `300`,
    description: "Hover delay before showing (ms).",
  },
  {
    prop: "avoidCollisions",
    type: `boolean`,
    default: `true`,
    description: "Flip/shift to stay in the viewport.",
  },
  {
    prop: "open / defaultOpen / onOpenChange",
    type: `—`,
    default: `— / false / —`,
    description: "Controlled API.",
  },
];
