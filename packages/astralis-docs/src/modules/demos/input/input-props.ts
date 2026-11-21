import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the input component's types in astralis-ui. */
export const inputProps: PropRow[] = [
  {
    prop: "variant",
    type: `"outline" | "filled" | "underline" | "unstyled"`,
    default: `"outline"`,
    description: "Visual style.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Height and padding.",
  },
  {
    prop: "rounded",
    type: `"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"`,
    default: `"lg"`,
    description: "Corner radius, on Button's scale. Unset, underline and unstyled stay square. Also on Input.Password and Input.Search.",
  },
  {
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `false`,
    description: "State flags, inherited automatically inside a [Field](/docs/components/field).",
  },
];
