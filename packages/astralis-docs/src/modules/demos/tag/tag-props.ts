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
