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
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `false`,
    description: "State flags — inherited automatically inside a [Field](/docs/components/field).",
  },
];
