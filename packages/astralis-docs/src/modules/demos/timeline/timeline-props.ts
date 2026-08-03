import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the timeline component's types in astralis-ui. */
export const timelineProps: PropRow[] = [
  {
    prop: "variant",
    type: `"solid" | "subtle" | "outline"`,
    default: `"solid"`,
    description: "Indicator fill style.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Indicator diameter and text scale.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Default indicator hue; overridable per Indicator.",
  },
];
