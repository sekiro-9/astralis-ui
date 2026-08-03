import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the field component's types in astralis-ui. */
export const fieldProps: PropRow[] = [
  {
    prop: "invalid",
    type: `boolean`,
    default: `false`,
    description: "Error styling + `aria-invalid` on the child input.",
  },
  {
    prop: "disabled",
    type: `boolean`,
    default: `false`,
    description: "Disables the child input.",
  },
  {
    prop: "required",
    type: `boolean`,
    default: `false`,
    description: "Appends `*` to the label, sets `aria-required`.",
  },
  {
    prop: "readOnly",
    type: `boolean`,
    default: `false`,
    description: "Read-only state.",
  },
  {
    prop: "id",
    type: `string`,
    default: `auto`,
    description: "Explicit id for the label/input pair.",
  },
];
