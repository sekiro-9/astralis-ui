import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the multi-select component's types in astralis-ui. */
export const multiSelectProps: PropRow[] = [
  {
    prop: "options",
    type: `{ value, label, disabled? }[] or grouped`,
    default: `[]`,
    description: "Option data; same group shape as [Select](/docs/components/select).",
  },
  {
    prop: "value / defaultValue / onChange",
    type: `Array<string | number> / same / (values) => void`,
    default: `— / [] / —`,
    description: "Controlled / uncontrolled API.",
  },
  {
    prop: "max",
    type: `number`,
    description: "Cap on selected items.",
  },
  {
    prop: "clearable",
    type: `boolean`,
    default: `false`,
    description: "Clear-all button.",
  },
  {
    prop: "name",
    type: `string`,
    description: "Renders one hidden input per selected value (repeated name) for native `<form>` submission.",
  },
  {
    prop: "placeholder / emptyText / loading",
    type: `—`,
    description: "Same behavior as Select.",
  },
  {
    prop: "variant / size / colorScheme",
    type: `—`,
    default: `"outline" / "md" / "brand"`,
    description: "Styling; colorScheme tints the tags.",
  },
  {
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `false`,
    description: "State flags — inherited from [Field](/docs/components/field).",
  },
];
