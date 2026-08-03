import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the progress component's types in astralis-ui. */
export const progressProps: PropRow[] = [
  {
    prop: "value",
    type: `number`,
    description: "Current progress. **Omit entirely for indeterminate.**",
  },
  {
    prop: "max",
    type: `number`,
    default: `100`,
    description: "The value that counts as 100%.",
  },
  {
    prop: "shape",
    type: `"line" | "circle"`,
    default: `"line"`,
    description: "Bar or ring.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Bar height / ring diameter.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Hue of the filled portion.",
  },
  {
    prop: "showValueLabel",
    type: `boolean`,
    default: `false`,
    description: "Percentage text (hidden while indeterminate).",
  },
];
