import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with packages/astralis-ui/src/components/data-entry/combobox/combobox.types.ts */
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
    description: "Controlled / uncontrolled selection; null means nothing is selected.",
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
    prop: "placeholder",
    type: "string",
    description: "Input text shown while nothing is typed or selected.",
  },
  {
    prop: "allowCustomValue",
    type: "boolean",
    default: "false",
    description:
      "Typed text that matches no option commits as the value, so the options become suggestions. Tab, blur, or Enter with nothing highlighted commits; Escape reverts.",
  },
  {
    prop: "clearable",
    type: "boolean",
    default: "false",
    description: "✕ button when a value is selected.",
  },
  {
    prop: "emptyText",
    type: "string",
    default: `"No matches"`,
    description: "Shown when nothing matches.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Field height and text size, matching Input.",
  },
  {
    prop: "variant",
    type: `"outline" | "filled" | "underline" | "unstyled"`,
    default: `"outline"`,
    description: "Field chrome, matching Input.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Hue for the focus ring and the highlighted option.",
  },
  {
    prop: "loading",
    type: "boolean",
    default: "false",
    description: "Shows a spinner and disables the input while options load.",
  },
  {
    prop: "invalid",
    type: "boolean",
    default: "false",
    description: "Error styling and aria-invalid. Inherited inside a Field.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Blocks interaction. Inherited inside a Field.",
  },
  {
    prop: "readOnly",
    type: "boolean",
    default: "false",
    description: "Shows the value but can't be changed.",
  },
  {
    prop: "name",
    type: "string",
    description: "Hidden input for native form submission.",
  },
];
