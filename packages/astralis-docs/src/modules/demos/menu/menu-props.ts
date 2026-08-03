import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the menu component's types in astralis-ui. */
export const menuProps: PropRow[] = [
  {
    prop: "open / defaultOpen / onOpenChange",
    type: `—`,
    description: "Controlled/uncontrolled open state.",
  },
  {
    prop: "side",
    type: `"top" | "bottom" | "left" | "right"`,
    default: `"bottom"`,
    description: "Preferred side (flips on collision).",
  },
  {
    prop: "align",
    type: `"start" | "center" | "end"`,
    default: `"start"`,
    description: "Alignment along the trigger.",
  },
  {
    prop: "sideOffset",
    type: `number`,
    default: `6`,
    description: "Gap to the trigger, px.",
  },
  {
    prop: "closeOnSelect",
    type: `boolean`,
    default: `true`,
    description: "Close after an item activates.",
  },
];
