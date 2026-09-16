import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with packages/astralis-ui/src/components/data-entry/radio-card/radio-card.types.ts */
export const radioCardProps: PropRow[] = [
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
    prop: "value",
    type: "string",
    description: "The value this card selects inside a Radio.Group.",
  },
  {
    prop: "indicator",
    type: "boolean",
    default: "true",
    description: "Shows a tick in the corner while selected.",
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
    description: "Hue of the selected card.",
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
    description: "Blocks selection. Inherited from a Radio.Group or Field.",
  },
];
