import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the loader component's types in astralis-ui. */
export const loaderProps: PropRow[] = [
  {
    prop: "variant",
    type: `"blocks" | "spinner" | "dots" | "bars" | "pulse"`,
    default: `"blocks"`,
    description: "Which animation. blocks is the Astralis mark assembling itself.",
  },
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg" | "xl"`,
    default: `"md"`,
    description: "Width and height of the indicator.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Hue of the indicator.",
  },
  {
    prop: "label",
    type: `string`,
    default: `"Loading…"`,
    description: "Visually-hidden text announced to screen readers.",
  },
];
