import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the pin-input component's types in astralis-ui. */
export const pinInputProps: PropRow[] = [
  {
    prop: "length",
    type: `number`,
    default: `4`,
    description: "Number of boxes.",
  },
  {
    prop: "value / defaultValue / onChange",
    type: `string / string / (value: string) => void`,
    default: `— / "" / —`,
    description: "The combined code.",
  },
  {
    prop: "onComplete",
    type: `(value: string) => void`,
    description: "Fires when all boxes are filled.",
  },
  {
    prop: "type",
    type: `"numeric" | "alpha" | "alphanumeric"`,
    default: `"numeric"`,
    description: "Character validation.",
  },
  {
    prop: "mask",
    type: `boolean`,
    default: `false`,
    description: "Bullet display, password-style.",
  },
  {
    prop: "variant / size",
    type: `"outline" | "filled" / "sm" | "md" | "lg"`,
    default: `"outline" / "md"`,
    description: "Styling.",
  },
  {
    prop: "placeholder",
    type: `string`,
    default: `"○"`,
    description: "Shown in empty boxes.",
  },
  {
    prop: "autoFocus",
    type: `boolean`,
    default: `false`,
    description: "Focus the first box on mount.",
  },
  {
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `false`,
    description: "State flags — inherited from [Field](/docs/components/field).",
  },
];
