import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the switch component's types in astralis-ui. */
export const switchProps: PropRow[] = [
  {
    prop: "checked / defaultChecked / onChange",
    type: `boolean / boolean / (e) => void`,
    default: `— / false / —`,
    description: "Controlled / uncontrolled API.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Track and thumb dimensions.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "On-state hue.",
  },
  {
    prop: "children",
    type: `ReactNode`,
    description: "Label rendered beside the track.",
  },
  {
    prop: "invalid / disabled / readOnly",
    type: `boolean`,
    default: `false`,
    description: "State flags — inherited from [Field](/docs/components/field).",
  },
];
