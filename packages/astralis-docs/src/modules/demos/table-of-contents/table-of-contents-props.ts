import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/navigation/table-of-contents/table-of-contents.types.ts */
export const tableOfContentsProps: PropRow[] = [
  {
    prop: "items",
    type: "{ id: string; title: string; depth?: number }[]",
    description: "The entries. Each id must match a heading's id on the page; depth indents it. Required.",
  },
  {
    prop: "label",
    type: "string",
    default: `"On this page"`,
    description: "Accessible name of the nav, also shown as a title above the list.",
  },
  {
    prop: "showLabel",
    type: "boolean",
    default: "true",
    description: "Shows the label above the list. Hidden, it still names the nav.",
  },
  {
    prop: "offset",
    type: "number",
    default: "80",
    description: "Height of a sticky header, in pixels, so the entry highlights when its heading clears it.",
  },
];
