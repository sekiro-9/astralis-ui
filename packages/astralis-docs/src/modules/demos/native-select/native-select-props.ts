import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/data-entry/native-select/native-select.types.ts */
export const nativeSelectProps: PropRow[] = [
  {
    prop: "children",
    type: "ReactNode",
    description: "Native option and optgroup elements.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Field height, matching Input.",
  },
  {
    prop: "variant",
    type: `"outline" | "filled"`,
    default: `"outline"`,
    description: "Field chrome, matching Input.",
  },
  {
    prop: "placeholder",
    type: "string",
    description: "A disabled empty option shown until a value is chosen.",
  },
  {
    prop: "invalid",
    type: "boolean",
    default: "false",
    description: "Error styling and aria-invalid. Inherited inside a Field.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Blocks interaction. Inherited inside a Field.",
  },
];
