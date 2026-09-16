import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/data-display/marquee/marquee.types.ts */
export const marqueeProps: PropRow[] = [
  {
    prop: "direction",
    type: `"left" | "right" | "up" | "down"`,
    default: `"left"`,
    description: "Scroll axis and direction.",
  },
  {
    prop: "speed",
    type: "number",
    default: "50",
    description: "Pixels per second.",
  },
  {
    prop: "gap",
    type: "string",
    default: `"1rem"`,
    description: "CSS length between items, and at the loop seam.",
  },
  {
    prop: "reverse",
    type: "boolean",
    default: "false",
    description: "Flips the direction.",
  },
  {
    prop: "pauseOnHover",
    type: "boolean",
    default: "false",
    description: "Pauses while the pointer is over the strip.",
  },
  {
    prop: "pauseOnFocus",
    type: "boolean",
    default: "false",
    description: "Pauses while focus is inside. Turn it on when items are interactive.",
  },
  {
    prop: "gradient",
    type: "boolean",
    default: "false",
    description: "Fades both edges into the background.",
  },
  {
    prop: "gradientColor",
    type: "string",
    default: "page background",
    description: "CSS color the edges fade into.",
    control: { kind: "omit" },
  },
  {
    prop: "gradientWidth",
    type: "string",
    default: `"10%"`,
    description: "Width of each edge fade.",
  },
  {
    prop: "loopCount",
    type: "number",
    default: "0",
    description: "Loops before the strip stops. 0 loops forever.",
    control: { kind: "omit" },
  },
];

export const marqueePartsProps: PropRow[] = [
  {
    prop: "Marquee.Item",
    type: "div props",
    description:
      "One entry in the strip. The items are rendered twice for a seamless loop, and the copy is hidden from assistive technology.",
  },
];
