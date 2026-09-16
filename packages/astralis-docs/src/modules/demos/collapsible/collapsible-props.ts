import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/disclosure/collapsible/collapsible.types.ts */
export const collapsibleProps: PropRow[] = [
  {
    prop: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Open on first render. There is no controlled open prop: the state belongs to the browser.",
  },
  {
    prop: "name",
    type: "string",
    description: "Collapsibles sharing a name form a native exclusive group, where opening one closes the others.",
    control: { kind: "omit" },
  },
];

export const collapsibleTriggerProps: PropRow[] = [
  {
    prop: "hideIndicator",
    type: "boolean",
    default: "false",
    description: "Hides the built-in chevron, for when you draw your own.",
  },
];

export const collapsiblePartsProps: PropRow[] = [
  {
    prop: "Collapsible.Trigger",
    type: "summary props",
    description: "The always-visible summary line that toggles the content.",
  },
  {
    prop: "Collapsible.Content",
    type: "div props",
    description: "The content shown while open. Adds spacing and typography only.",
  },
];
