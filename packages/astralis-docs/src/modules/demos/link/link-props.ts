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
    description: "Hue (via the accent channel). `inherit` uses the scheme of the section the link sits in.",
  },
  {
    prop: "external",
    type: `boolean`,
    default: `false`,
    description: "New tab + `rel=\"noopener noreferrer\"` + ↗ marker.",
  },
  {
    prop: "hover · focusVisible · active",
    type: `{ color, w, h, m*, inset… }`,
    description:
      "Styles for that state, same tokens as the base props: `hover={{ color: \"base\" }}`. A state carries only the props this component takes, so colour and the placement props, not paint or padding. An explicit hover colour replaces the accent hover shift.",
  },
  {
    prop: "lineClamp",
    type: `"1" | "2" | "3" | "4" | "5" | "6"`,
    description: "Truncates a long link to this many lines with an ellipsis. Responsive.",
  },
  {
    prop: "as",
    type: `ElementType`,
    default: `"a"`,
    description: "Router link component.",
  },
];
