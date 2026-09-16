import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/layout/scroll-area/scroll-area.types.ts */
export const scrollAreaProps: PropRow[] = [
  {
    prop: "direction",
    type: `"vertical" | "horizontal" | "both"`,
    default: `"vertical"`,
    description: "Which axis scrolls.",
  },
  {
    prop: "hideScrollbar",
    type: "boolean",
    default: "false",
    description: "Hides the bar entirely; the content still scrolls.",
  },
];
