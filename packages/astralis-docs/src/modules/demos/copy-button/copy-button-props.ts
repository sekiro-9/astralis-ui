import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with packages/astralis-ui/src/components/buttons/copy-button/copy-button.types.ts */
export const copyButtonProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    description: "The text written to the clipboard. Required.",
    control: { kind: "omit" },
  },
  {
    prop: "children",
    type: "ReactNode",
    default: `"Copy"`,
    description: "Label at rest.",
  },
  {
    prop: "copiedLabel",
    type: "ReactNode",
    default: `"Copied"`,
    description: "Label while the copied state lasts.",
  },
  {
    prop: "timeout",
    type: "number",
    default: "1600",
    description: "How long the copied state lasts, in milliseconds.",
  },
  {
    prop: "variant",
    type: `"solid" | "subtle" | "surface" | "outline" | "text" | "link"`,
    default: `"solid"`,
    description: "Button style, as on Button.",
  },
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg" | "xl"`,
    default: `"md"`,
    description: "Button size, as on Button.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: `"brand"`,
    description: "Button hue, as on Button.",
  },
];
