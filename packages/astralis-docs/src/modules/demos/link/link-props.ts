import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the link component's types in astralis-ui. */
export const linkProps: PropRow[] = [
  {
    prop: "variant",
    type: `"underline" | "hover" | "plain"`,
    default: `"hover"`,
    description: "Underline behavior.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Hue (via the accent channel).",
  },
  {
    prop: "external",
    type: `boolean`,
    default: `false`,
    description: "New tab + `rel=\"noopener noreferrer\"` + ↗ marker.",
  },
  {
    prop: "as",
    type: `ElementType`,
    default: `"a"`,
    description: "Router link component.",
  },
];
