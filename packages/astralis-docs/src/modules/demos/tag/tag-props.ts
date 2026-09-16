import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with the tag component's types in astralis-ui. */
export const tagProps: PropRow[] = [
  {
    prop: "variant",
    type: `"solid" | "subtle" | "surface" | "outline"`,
    default: `"subtle"`,
    description: "Same family as Button/Badge.",
  },
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Chip size (same scale as Badge).",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"gray"`,
    description: "Hue.",
  },
  {
    prop: "startElement / endElement",
    type: `ReactNode`,
    description: "Leading / trailing slots (endElement yields to the close button).",
  },
  {
    prop: "closable / onClose",
    type: `boolean / () => void`,
    description: "Adds the ✕ remove button.",
  },
];

export const checkableTagProps: PropRow[] = [
  {
    prop: "checked / onChange",
    type: "boolean / (checked: boolean) => void",
    description: "Selected state and its change callback.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Hue used while checked.",
  },
];

export const checkableTagGroupProps: PropRow[] = [
  {
    prop: "options",
    type: "{ label, value }[] | (string | number)[]",
    description: "The chips to render. Required.",
  },
  {
    prop: "value / onChange",
    type: "(string | number)[] / (value) => void",
    description: "The selected values and their change callback. The group is always controlled, so pass both.",
  },
  {
    prop: "multiple",
    type: "boolean",
    default: "false",
    description: "Allow several selected at once. Otherwise selecting one clears the rest.",
  },
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Size of every chip.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Checked hue of every chip.",
  },
];
