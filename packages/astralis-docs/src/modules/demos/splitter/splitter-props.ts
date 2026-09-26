import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/layout/splitter/splitter.types.ts */
export const splitterProps: PropRow[] = [
  {
    prop: "orientation",
    type: `"horizontal" | "vertical"`,
    default: `"horizontal"`,
    description: "Split axis. horizontal puts the panels side by side.",
  },
  {
    prop: "size · defaultSize · onResize",
    type: "number · number · (size: number) => void",
    default: "None · 50 · None",
    description: "Controlled / initial share of the first panel, in percent, and the change callback.",
  },
  {
    prop: "minSize",
    type: "number",
    default: "10",
    description: "Smallest share the first panel can shrink to, in percent.",
  },
  {
    prop: "maxSize",
    type: "number",
    default: "90",
    description: "Largest share the first panel can grow to, in percent.",
  },
];

export const splitterPartsProps: PropRow[] = [
  {
    prop: "Splitter.Panel",
    type: "div props",
    description: "One of the two panes, addressed by DOM order. The second takes the remaining space.",
  },
  {
    prop: "Splitter.Handle",
    type: "div props",
    description: "The draggable divider between the panels. Give it an aria-label.",
  },
];
