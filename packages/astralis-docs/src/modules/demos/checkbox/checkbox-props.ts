import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the checkbox component's types in astralis-ui. */
export const checkboxProps: PropRow[] = [
  {
    prop: "checked / defaultChecked / onChange",
    type: `boolean / boolean / (e) => void`,
    default: `— / false / —`,
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
    description: "State flags — inherited from [Field](/docs/components/field).",
  },
];
