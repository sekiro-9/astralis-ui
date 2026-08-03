import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with packages/astralis-ui/src/components/data-display/badge/badge.types.ts */
export const badgeProps: PropRow[] = [
  {
    prop: "variant",
    type: `"solid" | "subtle" | "surface" | "outline"`,
    default: `"subtle"`,
    description: "Visual style. surface is the bordered sibling of subtle.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"gray"`,
    description: "Hue the badge paints with, via the accent channel.",
  },
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg"`,
    default: `"sm"`,
    description: "Text and padding scale.",
  },
];
