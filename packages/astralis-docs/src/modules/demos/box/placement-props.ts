import type { PropRow } from "@/modules/docs/props-table";

/**
 * The placement set: the props every component accepts, including the ones
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
    description: "How the component behaves as a flex child: whether it fills, holds, or shrinks.",
  },
  {
    prop: "order · alignSelf",
    type: `"first" | "last" | "none" · "start" | "center" | "end" | "stretch" | "baseline"`,
    description: "Where it sits among its siblings, overriding the parent's alignment for one child.",
  },
  {
    prop: "position · inset · top/right/bottom/left · zIndex",
    type: `"static" | "relative" | "absolute" | "fixed" | "sticky" · spacing scale · "lowest" – "max"`,
    description: "Takes the component out of the flow or pins it, for example a Badge in the corner of a Card.",
  },
  {
    prop: "m · mx · my · mt/mb/ml/mr",
    type: `"0" – "96" (spacing scale) | "auto"`,
    description:
      "Space between the component and its siblings. auto is the layout tool: ml=\"auto\" pushes a flex item to the far edge, mx=\"auto\" centres a fixed-width block.",
  },
  {
    prop: "animation · reveal",
    type: `"fade-in" | "fade-up" | "fade-down" | "slide-left" | "slide-right" | "scale-in" | "pop" | "blur-in"`,
    description:
      "How the component arrives: animation plays once on render, reveal as it scrolls into view. Pure CSS, and still under reduced motion. See Animations.",
  },
  {
    prop: "animationDuration · animationDelay",
    type: `"fast" | "normal" | "slow" · "75" – "1000" (milliseconds)`,
    description:
      "How long an animation takes, and how long it waits before starting, for staggering siblings. On a reveal, how much of the scroll it spans and how much later in the scroll it starts.",
  },
  {
    prop: "animationDistance",
    type: `"sm" | "md" | "lg" | "xl"`,
    description: "How far an animation or reveal travels: md is the default, sm half, lg twice, xl three times.",
  },
  {
    prop: "revealMode",
    type: `"scroll" | "once"`,
    description:
      "scroll (the default) ties a reveal to the scroll position; once plays it the first time it scrolls into view and keeps it shown. once needs scroll-triggered animations (Chrome and Edge today); elsewhere it falls back to scroll.",
  },
];
