import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the slider component's types in astralis-ui. */
export const sliderProps: PropRow[] = [
  {
    prop: "min / max / step",
    type: `number`,
    default: `0 / 100 / 1`,
    description: "The scale.",
  },
  {
    prop: "value / defaultValue / onChange",
    type: `number (Slider) or [number, number] (RangeSlider)`,
    description: "Controlled / uncontrolled API.",
  },
  {
    prop: "marks",
    type: `boolean | { value, label? }[]`,
    description: "Tick marks, optionally labeled.",
  },
  {
    prop: "showTooltip",
    type: `boolean`,
    default: `true`,
    description: "Value tooltip on the thumb.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Track and thumb scale.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Filled-track and thumb hue.",
  },
  {
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `false`,
    description: "State flags — inherited from [Field](/docs/components/field).",
  },
];
