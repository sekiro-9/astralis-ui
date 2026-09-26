import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the radio component's types in astralis-ui. */
export const radioProps: PropRow[] = [
  {
    prop: "value",
    type: `string | number`,
    description: "Required; identifies the option.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Circle size.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Selected hue.",
  },
  {
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `false`,
    description: "State flags, inherited from [Field](/docs/components/field).",
  },
];

export const radioGroupProps: PropRow[] = [
  {
    prop: "value / defaultValue / onValueChange",
    type: "string / string / (value: string) => void",
    description: "Controlled / uncontrolled selection. onChange still fires too, but is deprecated.",
  },
  {
    prop: "name",
    type: "string",
    default: "generated",
    description: "Name shared by the radios in the set.",
  },
  {
    prop: "orientation",
    type: `"horizontal" | "vertical"`,
    default: `"vertical"`,
    description: "Lays the radios out in a row or a column.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    description: "Hue of every radio in the group; each can still override it.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables every radio in the group.",
  },
];
