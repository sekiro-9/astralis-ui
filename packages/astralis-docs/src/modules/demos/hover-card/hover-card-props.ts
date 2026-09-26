import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/overlay/hover-card/hover-card.types.ts */
export const hoverCardProps: PropRow[] = [
  {
    prop: "open · defaultOpen · onOpenChange",
    type: "boolean · boolean · (open: boolean) => void",
    default: "None · false · None",
    description: "Controlled / initial state, and the change callback.",
  },
  {
    prop: "side",
    type: `"top" | "right" | "bottom" | "left"`,
    default: `"bottom"`,
    description: "Preferred side of the trigger.",
  },
  {
    prop: "align",
    type: `"start" | "center" | "end"`,
    default: `"center"`,
    description: "Alignment along that side.",
  },
  {
    prop: "sideOffset",
    type: "number",
    default: "8",
    description: "Gap between the trigger and the card, in pixels.",
  },
  {
    prop: "avoidCollisions",
    type: "boolean",
    default: "true",
    description: "Flips to the opposite side when the card would overflow the viewport.",
  },
  {
    prop: "openDelay",
    type: "number",
    default: "400",
    description: "How long the pointer must rest on the trigger before the card opens, in ms.",
  },
  {
    prop: "closeDelay",
    type: "number",
    default: "200",
    description: "Grace period for the pointer to travel into the card before it closes, in ms.",
  },
];

export const hoverCardPartsProps: PropRow[] = [
  {
    prop: "HoverCard.Trigger",
    type: "children: ReactElement",
    description: "Wraps a single element, typically a Link. Hover and focus open the card.",
  },
  {
    prop: "HoverCard.Content",
    type: "div props",
    description: "The raised card. Its content can be interactive.",
  },
];
