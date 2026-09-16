import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/typography/blockquote/blockquote.types.ts */
export const blockquoteProps: PropRow[] = [
  {
    prop: "variant",
    type: `"plain" | "subtle"`,
    default: `"plain"`,
    description: "The leading rule alone, or the rule on a tinted panel. Responsive.",
  },
  {
    prop: "cite",
    type: "ReactNode",
    description: "Visible attribution, rendered under the quote in a cite element.",
  },
  {
    prop: "citeUrl",
    type: "string",
    description: "URL of the source, set as the blockquote element's native cite attribute.",
  },
];
