import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/data-display/stat/stat.types.ts */
export const statProps: PropRow[] = [
  {
    prop: "size",
    type: `"sm" | "md" | "lg" | "xl"`,
    default: `"md"`,
    description:
      "Scales label, value and help text together. md suits dashboards, xl marketing bands. Responsive.",
  },
  {
    prop: "align",
    type: `"start" | "center" | "end"`,
    default: `"start"`,
    description: "How the lines align within the stat. Responsive.",
  },
];

export const statPartsProps: PropRow[] = [
  {
    prop: "Stat.Label / Value / HelpText",
    type: "span props",
    description: "The three lines. Each takes its size from the root.",
  },
  {
    prop: "Stat.Indicator",
    type: `type?: "increase" | "decrease"`,
    description: "Trend arrow inside the help text, colored for the direction.",
  },
];
