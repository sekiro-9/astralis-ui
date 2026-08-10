import type { PropRow } from "@/modules/docs/props-table";

/**
 * The placement set — the props every component accepts, including the ones
 * with their own recipe. Keep in sync with PLACEMENT_PROP_NAMES in
 * astralis-ui/src/utils/placement.ts, which is the single source of truth.
 */
export const placementProps: PropRow[] = [
  {
    prop: "w · minW · maxW",
    type: `"0" – "96", "full", "screen", fractions, "xs" – "7xl"`,
    description: "How much horizontal room the component takes in its parent.",
  },
  {
    prop: "h · minH · maxH",
    type: `"0" – "96", "full", "screen", fractions`,
    description: "The same vertically.",
  },
  {
    prop: "flex · basis · grow · shrink",
    type: `"1", "auto", "initial", "none" · spacing scale`,
    description: "How the component behaves as a flex child — whether it fills, holds, or shrinks.",
  },
  {
    prop: "order · alignSelf",
    type: `"first" | "last" | "none" · "start" | "center" | "end" | "stretch" | "baseline"`,
    description: "Where it sits among its siblings, overriding the parent's alignment for one child.",
  },
  {
    prop: "m · mx · my · mt/mb/ml/mr",
    type: `"0" – "96" (spacing scale) | "auto"`,
    description:
      "Space between the component and its siblings. auto is the layout tool: ml=\"auto\" pushes a flex item to the far edge, mx=\"auto\" centres a fixed-width block.",
  },
];
