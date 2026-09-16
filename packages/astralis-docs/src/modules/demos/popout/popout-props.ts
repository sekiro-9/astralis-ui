import type { PropRow } from "@/modules/docs/props-table";

/**
 * Popout's root takes only children; the panel is configured on its Content.
 * Keep in sync with packages/astralis-ui/src/components/overlay/popout/popout.types.ts
 */
export const popoutContentProps: PropRow[] = [
  {
    prop: "side",
    type: `"top" | "bottom" | "left" | "right"`,
    default: `"bottom"`,
    description: "Which side of the trigger the panel opens on.",
  },
  {
    prop: "align",
    type: `"start" | "center" | "end"`,
    default: `"start"`,
    description: "Alignment along that side.",
  },
  {
    prop: "sideOffset",
    type: "number",
    default: "8",
    description: "Gap between the trigger and the panel, in pixels.",
  },
];

export const popoutPartsProps: PropRow[] = [
  {
    prop: "Popout.Trigger",
    type: "button props",
    description: "Renders a button wired to the panel with popovertarget.",
  },
  {
    prop: "Popout.Content",
    type: "div props, plus the props above",
    description: "The native popover panel.",
  },
];
