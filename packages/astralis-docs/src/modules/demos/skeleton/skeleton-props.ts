import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the skeleton component's types in astralis-ui. */
export const skeletonProps: PropRow[] = [
  {
    prop: "variant",
    type: `"text" | "circle" | "rect"`,
    default: `"text"`,
    description: "Placeholder shape (size `circle`/`rect` via className or style).",
  },
  {
    prop: "animated",
    type: `boolean`,
    default: `true`,
    description: "Pulse animation — automatically pauses under `prefers-reduced-motion`.",
  },
  {
    prop: "loaded",
    type: `boolean`,
    default: `false`,
    description: "Render children instead of the placeholder.",
  },
];
