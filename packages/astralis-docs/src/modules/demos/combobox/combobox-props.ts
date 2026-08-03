import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the combobox component's types in astralis-ui. */
export const comboboxProps: PropRow[] = [
  {
    prop: "options",
    type: `Array<{label, value, disabled?} | {group, options}>`,
    default: `[]`,
    description: "Flat or grouped options.",
  },
  {
    prop: "value / defaultValue",
    type: `string | number | null`,
    description: "Controlled / uncontrolled selection.",
  },
  {
    prop: "onChange",
    type: `(value) => void`,
    description: "Fires on commit (pick or clear).",
  },
  {
    prop: "onInputChange",
    type: `(text) => void`,
    description: "Fires on every filter keystroke.",
  },
  {
    prop: "clearable",
    type: `boolean`,
    default: `false`,
    description: "✕ button when a value is selected.",
  },
  {
    prop: "name",
    type: `string`,
    description: "Hidden input for native form submission.",
  },
  {
    prop: "emptyText",
    type: `string`,
    default: `"No matches"`,
    description: "Shown when nothing matches.",
  },
  {
    prop: "size / variant / colorScheme / invalid / disabled / readOnly / loading",
    type: `—`,
    default: `as Select`,
    description: "Shared styling + state system.",
  },
];
