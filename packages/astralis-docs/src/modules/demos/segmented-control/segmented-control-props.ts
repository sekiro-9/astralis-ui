import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/data-entry/segmented-control/segmented-control.types.ts */
export const segmentedControlProps: PropRow[] = [
  {
    prop: "value / defaultValue / onChange",
    type: "string / string / (value: string) => void",
    description: "Controlled / uncontrolled selection.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Segment height and text size.",
  },
  {
    prop: "fullWidth",
    type: "boolean",
    default: "false",
    description: "Stretches to the container, sharing the width equally between segments.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables every segment.",
  },
  {
    prop: "name",
    type: "string",
    default: "generated",
    description: "Name of the segment radios, so the choice submits with a native form.",
  },
];

export const segmentedControlItemProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    description: "The value this segment represents. Required.",
  },
  {
    prop: "children",
    type: "ReactNode",
    description: "Segment label.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables just this segment.",
  },
];
