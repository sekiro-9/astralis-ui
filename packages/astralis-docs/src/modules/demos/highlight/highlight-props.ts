import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/typography/highlight/highlight.types.ts */
export const highlightProps: PropRow[] = [
  {
    prop: "children",
    type: "string",
    description: "The plain text to scan. Required.",
    control: { kind: "omit" },
  },
  {
    prop: "query",
    type: "string | string[]",
    description: "The substring or substrings to wrap in mark elements. Required.",
  },
  {
    prop: "variant",
    type: `"subtle" | "solid"`,
    default: `"subtle"`,
    description: "Tinted or fully filled marks.",
  },
  {
    prop: "ignoreCase",
    type: "boolean",
    default: "true",
    description: "Match regardless of letter case.",
  },
  {
    prop: "markClassName",
    type: "string",
    description: "Extra class for each mark element.",
    control: { kind: "omit" },
  },
];
