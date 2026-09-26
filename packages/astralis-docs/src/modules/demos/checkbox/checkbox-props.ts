import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the checkbox component's types in astralis-ui. */
export const checkboxProps: PropRow[] = [
  {
    prop: "checked / defaultChecked / onChange",
    type: `boolean / boolean / (e) => void`,
    default: `None / false / None`,
    description: "Controlled / uncontrolled API.",
  },
  {
    prop: "value",
    type: `string`,
    description: "Identifies the checkbox inside a Group.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Box size.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Checked hue.",
  },
  {
    prop: "indeterminate",
    type: `boolean`,
    default: `false`,
    description: "Dash instead of check.",
  },
  {
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `false`,
    description: "State flags, inherited from [Field](/docs/components/field).",
  },
];

export const checkboxGroupProps: PropRow[] = [
  {
    prop: "value / defaultValue / onValueChange",
    type: "string[] / string[] / (value: string[]) => void",
    default: "None / [] / None",
    description: "Controlled / uncontrolled selection. onChange still fires too, but is deprecated.",
  },
  {
    prop: "orientation",
    type: `"horizontal" | "vertical"`,
    default: `"vertical"`,
    description: "Lays the checkboxes out in a row or a column.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    description: "Hue of every checkbox in the group; each can still override it.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables every checkbox in the group.",
  },
];
