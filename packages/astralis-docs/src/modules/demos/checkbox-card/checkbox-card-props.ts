import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with packages/astralis-ui/src/components/data-entry/checkbox-card/checkbox-card.types.ts */
export const checkboxCardProps: PropRow[] = [
  {
    prop: "children",
    type: "ReactNode",
    description: "Card title.",
  },
  {
    prop: "description",
    type: "ReactNode",
    description: "Secondary line under the title.",
  },
  {
    prop: "addon",
    type: "ReactNode",
    description: "Leading slot for an icon or avatar.",
  },
  {
    prop: "checked / defaultChecked / onChange",
    type: "boolean / boolean / (event) => void",
    description: "The native checkbox API. Inside a Checkbox.Group, pass value instead.",
  },
  {
    prop: "value",
    type: "string",
    description: "Identifies the card inside a Checkbox.Group.",
  },
  {
    prop: "indicator",
    type: "boolean",
    default: "true",
    description: "Shows a tick in the corner while checked.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Padding and text scale.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Hue of the checked card.",
  },
  {
    prop: "invalid",
    type: "boolean",
    default: "false",
    description: "Error styling and aria-invalid.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Blocks interaction. Inherited from a Checkbox.Group or Field.",
  },
];
