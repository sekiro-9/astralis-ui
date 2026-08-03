import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the popover component's types in astralis-ui. */
export const popoverProps: PropRow[] = [
  {
    prop: "side",
    type: `"top" | "right" | "bottom" | "left"`,
    default: `"bottom"`,
    description: "Preferred placement; flips on collision.",
  },
  {
    prop: "align",
    type: `"start" | "center" | "end"`,
    default: `"center"`,
    description: "Alignment along the side.",
  },
  {
    prop: "sideOffset / alignOffset",
    type: `number`,
    default: `8 / 0`,
    description: "Pixel gaps on each axis.",
  },
  {
    prop: "avoidCollisions",
    type: `boolean`,
    default: `true`,
    description: "Flip/shift to stay in the viewport.",
  },
  {
    prop: "closeOnEsc / closeOnOutsidePointer",
    type: `boolean`,
    default: `true`,
    description: "Dismissal behavior.",
  },
  {
    prop: "open / defaultOpen / onOpenChange",
    type: `—`,
    default: `— / false / —`,
    description: "Controlled API.",
  },
];
