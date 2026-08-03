import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the select component's types in astralis-ui. */
export const selectProps: PropRow[] = [
  {
    prop: "options",
    type: `{ value, label }[] or { group, options }[]`,
    default: `[]`,
    description: "The option data.",
  },
  {
    prop: "value / defaultValue / onChange",
    type: `string | number | null / same / (value) => void`,
    default: `— / null / —`,
    description: "Controlled / uncontrolled API.",
  },
  {
    prop: "placeholder",
    type: `string`,
    default: `"Select an option"`,
    description: "Trigger text when empty.",
  },
  {
    prop: "searchable",
    type: `boolean`,
    default: `false`,
    description: "Filter input inside the dropdown.",
  },
  {
    prop: "clearable",
    type: `boolean`,
    default: `false`,
    description: "× button when a value is selected (also fires `onClear`).",
  },
  {
    prop: "loading",
    type: `boolean`,
    default: `false`,
    description: "Spinner instead of the chevron.",
  },
  {
    prop: "emptyText",
    type: `string`,
    default: `"No options"`,
    description: "Shown when nothing matches.",
  },
  {
    prop: "name",
    type: `string`,
    description: "Renders a hidden input so the value submits with native `<form>`s.",
  },
  {
    prop: "variant / size",
    type: `"outline" | "filled" / "sm" | "md" | "lg"`,
    default: `"outline" / "md"`,
    description: "Styling.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Highlight and focus-ring hue.",
  },
  {
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `false`,
    description: "State flags — inherited from [Field](/docs/components/field).",
  },
];
