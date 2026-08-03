import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the code component's types in astralis-ui. */
export const codeProps: PropRow[] = [
  {
    prop: "variant",
    type: `"subtle" | "solid" | "outline"`,
    default: `"subtle"`,
    description: "Tinted, strongly tinted, or bordered — all track the active theme.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"sm"`,
    description: "Font size step.",
  },
];
