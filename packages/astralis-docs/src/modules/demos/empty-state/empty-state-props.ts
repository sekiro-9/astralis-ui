import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/feedback/empty-state/empty-state.types.ts */
export const emptyStateProps: PropRow[] = [
  {
    prop: "size",
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
    description: "Scales the indicator, title and description together.",
  },
];

export const emptyStatePartsProps: PropRow[] = [
  {
    prop: "EmptyState.Indicator",
    type: "div props",
    description: "Muted circle around an icon. Hidden from assistive technology, since the icon is decorative.",
  },
  {
    prop: "EmptyState.Title",
    type: "div props",
    description: "The headline. It isn't a heading element, so wrap it in one when it should appear in the outline.",
  },
  {
    prop: "EmptyState.Description",
    type: "div props",
    description: "Supporting copy, capped at a readable line length.",
  },
  {
    prop: "EmptyState.Actions",
    type: "div props",
    description: "A wrapping row for one or two Buttons.",
  },
];
