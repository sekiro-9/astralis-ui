import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/buttons/toolbar/toolbar.types.ts */
export const toolbarProps: PropRow[] = [
  {
    prop: "label",
    type: "string",
    description: "Accessible name, set as aria-label. A toolbar without one is just a row of buttons.",
    control: { kind: "omit" },
  },
  {
    prop: "orientation",
    type: `"horizontal" | "vertical"`,
    default: `"horizontal"`,
    description: "Layout direction, and which arrow keys move focus.",
  },
];

export const toolbarPartsProps: PropRow[] = [
  {
    prop: "Toolbar.Group",
    type: "div props",
    description: "A cluster of related controls with the group role. Give it an aria-label.",
  },
  {
    prop: "Toolbar.Separator",
    type: "div props",
    description: "A vertical rule between groups.",
  },
];
