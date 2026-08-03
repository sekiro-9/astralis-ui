import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the number-input component's types in astralis-ui. */
export const numberInputProps: PropRow[] = [
  {
    prop: "value / defaultValue",
    type: `number | null`,
    description: "Controlled / uncontrolled value.",
  },
  {
    prop: "onChange",
    type: `(value: number | null) => void`,
    description: "Fires on commit.",
  },
  {
    prop: "min / max",
    type: `number`,
    description: "Clamping bounds (also `aria-valuemin/max`).",
  },
  {
    prop: "step",
    type: `number`,
    default: `1`,
    description: "Arrow/stepper increment.",
  },
  {
    prop: "precision",
    type: `number`,
    description: "Decimal places on commit.",
  },
  {
    prop: "hideSteppers",
    type: `boolean`,
    default: `false`,
    description: "Remove the +/− buttons.",
  },
  {
    prop: "size / variant / invalid",
    type: `—`,
    default: `as Input`,
    description: "Shares the Input styling system.",
  },
];
