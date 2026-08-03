import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the spinner component's types in astralis-ui. */
export const spinnerProps: PropRow[] = [
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg" | "xl"`,
    default: `"md"`,
    description: "Diameter.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Hue of the spinning arc.",
  },
  {
    prop: "label",
    type: `string`,
    default: `"Loading…"`,
    description: "Visually-hidden text announced to screen readers.",
  },
];
