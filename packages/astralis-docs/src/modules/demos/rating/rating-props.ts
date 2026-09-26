import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with packages/astralis-ui/src/components/data-entry/rating/rating.types.ts */
export const ratingProps: PropRow[] = [
  {
    prop: "value / defaultValue / onChange",
    type: "number / number / (value: number) => void",
    default: "None / 0 / None",
    description: "Controlled / uncontrolled value. Fractions such as 4.5 render only in readOnly mode.",
  },
  {
    prop: "max",
    type: "number",
    default: "5",
    description: "Number of stars.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Star size.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"yellow"`,
    description: "Hue of the filled stars.",
  },
  {
    prop: "readOnly",
    type: "boolean",
    default: "false",
    description: "Static display with an img role, including half stars.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Blocks interaction.",
  },
  {
    prop: "label",
    type: "string",
    default: `"Rating"`,
    description: "Accessible name of the radio group. Without one, a surrounding Field's label names it.",
  },
  {
    prop: "name",
    type: "string",
    default: "generated",
    description: "Name of the star radios, so the rating submits with a native form.",
  },
];
