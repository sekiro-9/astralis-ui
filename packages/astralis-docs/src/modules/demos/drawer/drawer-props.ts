import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the drawer component's types in astralis-ui. */
export const drawerProps: PropRow[] = [
  {
    prop: "open / defaultOpen / onOpenChange",
    type: `boolean / boolean / (open) => void`,
    default: `— / false / —`,
    description: "Controlled / initial state and callback.",
  },
  {
    prop: "placement",
    type: `"left" | "right" | "top" | "bottom"`,
    default: `"right"`,
    description: "Edge to slide from.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg" | "xl" | "full"`,
    default: `"md"`,
    description: "Width (left/right) or height (top/bottom).",
  },
  {
    prop: "closeOnOverlayClick",
    type: `boolean`,
    default: `true`,
    description: "Dismiss on backdrop click.",
  },
  {
    prop: "closeOnEsc",
    type: `boolean`,
    default: `true`,
    description: "Dismiss on Escape.",
  },
];
