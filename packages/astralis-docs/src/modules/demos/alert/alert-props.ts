import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the alert component's types in astralis-ui. */
export const alertProps: PropRow[] = [
  {
    prop: "status",
    type: `"info" | "success" | "warning" | "error"`,
    default: `"info"`,
    description: "Picks the icon, hue, and ARIA role.",
  },
  {
    prop: "variant",
    type: `"subtle" | "solid" | "outline" | "left-accent"`,
    default: `"subtle"`,
    description: "Fill treatment.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `from status`,
    description: "Hue override (info→blue, success→green, warning→orange, error→red).",
  },
  {
    prop: "icon",
    type: `ReactNode | false`,
    default: `status icon`,
    description: "Replace or hide the leading icon.",
  },
  {
    prop: "onClose",
    type: `() => void`,
    description: "Renders the ✕ dismiss button.",
  },
];
