import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/data-entry/editable/editable.types.ts */
export const editableProps: PropRow[] = [
  {
    prop: "value / defaultValue / onChange",
    type: "string / string / (value: string) => void",
    default: `— / "" / —`,
    description: "Controlled / uncontrolled text. onChange fires on every keystroke while editing.",
  },
  {
    prop: "onSubmit",
    type: "(value: string) => void",
    description: "Fires when an edit is committed with Enter or blur.",
  },
  {
    prop: "onCancel",
    type: "() => void",
    description: "Fires when an edit is cancelled with Escape.",
  },
  {
    prop: "placeholder",
    type: "string",
    default: `"Click to edit"`,
    description: "Shown in the preview while the value is empty.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Text scale shared by the preview and the input.",
  },
  {
    prop: "submitOnBlur",
    type: "boolean",
    default: "true",
    description: "Blur commits the edit. Turn it off and blur cancels instead.",
  },
  {
    prop: "startWithEditView",
    type: "boolean",
    default: "false",
    description: "Mounts already editing.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Locks editing; the preview becomes plain text.",
  },
];

export const editablePartsProps: PropRow[] = [
  {
    prop: "Editable.Preview",
    type: "span props",
    description: "The value at rest. A button in the accessibility tree that starts editing.",
  },
  {
    prop: "Editable.Input",
    type: "input props",
    description: "The text field while editing. Focused with its text selected on entry.",
  },
];
