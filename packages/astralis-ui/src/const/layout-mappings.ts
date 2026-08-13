/* ==========================================================================
   ASTRALIS LAYOUT MAPPINGS (FLEXBOX, GRID, & SHARED PROPERTIES)
   ========================================================================== */

import { channelMap } from "./channel";

/* ==========================================================================
   0. VALUE-MAP HELPERS (channel props that live in this file)
   --------------------------------------------------------------------------
   These maps are token -> CSS VALUE (the rest of this file stays
   token -> class for the keyword props). "0" is the literal zero; escaped
   idents must match the token CSS files.
   ========================================================================== */

const GAP_STEPS = [
  "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "6", "7", "8",
  "9", "10", "11", "12", "14", "16", "20", "24", "28", "32", "36", "40", "44",
  "48", "52", "56", "60", "64", "72", "80", "96",
] as const;

export type GapToken = "0" | (typeof GAP_STEPS)[number];

const buildGap = (): Record<GapToken, string> => {
  const map = { "0": "0" } as Record<GapToken, string>;
  for (const s of GAP_STEPS) map[s] = `var(--astralis-spacing-${s.replace(/\./g, (c) => `\\${c}`)})`;
  return map;
};
const GAP_SCALE = channelMap(buildGap());

const BASIS_FRACTIONS = [
  "1/2", "1/3", "2/3", "1/4", "3/4", "1/5", "2/5", "3/5", "4/5", "1/6", "2/6",
  "3/6", "4/6", "5/6", "1/12", "2/12", "3/12", "4/12", "5/12", "6/12", "7/12",
  "8/12", "9/12", "10/12", "11/12",
] as const;
const BASIS_TSHIRTS = [
  "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl",
  "6xl", "7xl", "8xl",
] as const;

export type BasisToken =
  | GapToken
  | (typeof BASIS_TSHIRTS)[number]
  | (typeof BASIS_FRACTIONS)[number]
  | "auto" | "full" | "min" | "max" | "fit";

function buildBasis(): Record<BasisToken, string> {
  const map = { "0": "0", auto: "auto" } as Record<BasisToken, string>;
  const sizeVar = (t: string) => `var(--astralis-size-${t.replace(/[./]/g, (c) => `\\${c}`)})`;
  for (const s of GAP_STEPS) map[s] = sizeVar(s);
  for (const t of BASIS_TSHIRTS) map[t] = sizeVar(t);
  for (const f of BASIS_FRACTIONS) map[f] = sizeVar(f);
  for (const k of ["full", "min", "max", "fit"] as const) map[k] = sizeVar(k);
  return channelMap(map);
}

/* ==========================================================================
   1. FLEXBOX ONLY MAPPINGS
   ========================================================================== */

export const flexDirectionTypes = {
  row: "astralis:flex-row",
  column: "astralis:flex-col",
  "row-reverse": "astralis:flex-row-reverse",
  "column-reverse": "astralis:flex-col-reverse",
} as const;

export const flexWrapTypes = {
  wrap: "astralis:flex-wrap",
  nowrap: "astralis:flex-nowrap",
  "wrap-reverse": "astralis:flex-wrap-reverse",
} as const;

/* Channel prop (const/channel.ts): token -> CSS value, delivered through
   --astralis-basis. Rides the size scale — size.css declares every rung. */
export const flexBasisTypes = buildBasis();

export const flexTypes = {
  "1": "astralis:flex-1",
  auto: "astralis:flex-auto",
  initial: "astralis:flex-initial",
  none: "astralis:flex-none",
} as const;

export const flexGrowTypes = {
  true: "astralis:grow",
  false: "astralis:grow-0",
  "1": "astralis:grow",
  "0": "astralis:grow-0",
} as const;

export const flexShrinkTypes = {
  true: "astralis:shrink",
  false: "astralis:shrink-0",
  "1": "astralis:shrink",
  "0": "astralis:shrink-0",
} as const;

/* ==========================================================================
   2. CSS GRID ONLY MAPPINGS
   ========================================================================== */

export const gridTemplateColumns = {
  "1": "astralis:grid-cols-1",
  "2": "astralis:grid-cols-2",
  "3": "astralis:grid-cols-3",
  "4": "astralis:grid-cols-4",
  "5": "astralis:grid-cols-5",
  "6": "astralis:grid-cols-6",
  "7": "astralis:grid-cols-7",
  "8": "astralis:grid-cols-8",
  "9": "astralis:grid-cols-9",
  "10": "astralis:grid-cols-10",
  "11": "astralis:grid-cols-11",
  "12": "astralis:grid-cols-12",
  none: "astralis:grid-cols-none",
} as const;

export const gridTemplateRows = {
  "1": "astralis:grid-rows-1",
  "2": "astralis:grid-rows-2",
  "3": "astralis:grid-rows-3",
  "4": "astralis:grid-rows-4",
  "5": "astralis:grid-rows-5",
  "6": "astralis:grid-rows-6",
  none: "astralis:grid-rows-none",
} as const;

export const gridAutoFlow = {
  row: "astralis:grid-flow-row",
  col: "astralis:grid-flow-col",
  dense: "astralis:grid-flow-row-dense",
  "col-dense": "astralis:grid-flow-col-dense",
} as const;

export const gridAutoColumnsTypes = {
  auto: "astralis:auto-cols-auto",
  min: "astralis:auto-cols-min",
  max: "astralis:auto-cols-max",
  fr: "astralis:auto-cols-fr",
} as const;

export const gridAutoRowsTypes = {
  auto: "astralis:auto-rows-auto",
  min: "astralis:auto-rows-min",
  max: "astralis:auto-rows-max",
  fr: "astralis:auto-rows-fr",
} as const;

export const gridJustifyItemsTypes = {
  start: "astralis:justify-items-start",
  center: "astralis:justify-items-center",
  end: "astralis:justify-items-end",
  stretch: "astralis:justify-items-stretch",
} as const;

export const gridColSpanTypes = {
  "1": "astralis:col-span-1",
  "2": "astralis:col-span-2",
  "3": "astralis:col-span-3",
  "4": "astralis:col-span-4",
  "5": "astralis:col-span-5",
  "6": "astralis:col-span-6",
  "7": "astralis:col-span-7",
  "8": "astralis:col-span-8",
  "9": "astralis:col-span-9",
  "10": "astralis:col-span-10",
  "11": "astralis:col-span-11",
  "12": "astralis:col-span-12",
  full: "astralis:col-span-full",
} as const;

export const gridColStartTypes = {
  "1": "astralis:col-start-1",
  "2": "astralis:col-start-2",
  "3": "astralis:col-start-3",
  "4": "astralis:col-start-4",
  "5": "astralis:col-start-5",
  "6": "astralis:col-start-6",
  "7": "astralis:col-start-7",
  "8": "astralis:col-start-8",
  "9": "astralis:col-start-9",
  "10": "astralis:col-start-10",
  "11": "astralis:col-start-11",
  "12": "astralis:col-start-12",
  "13": "astralis:col-start-13",
  auto: "astralis:col-start-auto",
} as const;

export const gridColEndTypes = {
  "1": "astralis:col-end-1",
  "2": "astralis:col-end-2",
  "3": "astralis:col-end-3",
  "4": "astralis:col-end-4",
  "5": "astralis:col-end-5",
  "6": "astralis:col-end-6",
  "7": "astralis:col-end-7",
  "8": "astralis:col-end-8",
  "9": "astralis:col-end-9",
  "10": "astralis:col-end-10",
  "11": "astralis:col-end-11",
  "12": "astralis:col-end-12",
  "13": "astralis:col-end-13",
  auto: "astralis:col-end-auto",
} as const;

export const gridRowSpanTypes = {
  "1": "astralis:row-span-1",
  "2": "astralis:row-span-2",
  "3": "astralis:row-span-3",
  "4": "astralis:row-span-4",
  "5": "astralis:row-span-5",
  "6": "astralis:row-span-6",
  "7": "astralis:row-span-7",
  "8": "astralis:row-span-8",
  "9": "astralis:row-span-9",
  "10": "astralis:row-span-10",
  "11": "astralis:row-span-11",
  "12": "astralis:row-span-12",
  full: "astralis:row-span-full",
} as const;

export const gridRowStartTypes = {
  "1": "astralis:row-start-1",
  "2": "astralis:row-start-2",
  "3": "astralis:row-start-3",
  "4": "astralis:row-start-4",
  "5": "astralis:row-start-5",
  "6": "astralis:row-start-6",
  "7": "astralis:row-start-7",
  "8": "astralis:row-start-8",
  "9": "astralis:row-start-9",
  "10": "astralis:row-start-10",
  "11": "astralis:row-start-11",
  "12": "astralis:row-start-12",
  "13": "astralis:row-start-13",
  auto: "astralis:row-start-auto",
} as const;

export const gridRowEndTypes = {
  "1": "astralis:row-end-1",
  "2": "astralis:row-end-2",
  "3": "astralis:row-end-3",
  "4": "astralis:row-end-4",
  "5": "astralis:row-end-5",
  "6": "astralis:row-end-6",
  "7": "astralis:row-end-7",
  "8": "astralis:row-end-8",
  "9": "astralis:row-end-9",
  "10": "astralis:row-end-10",
  "11": "astralis:row-end-11",
  "12": "astralis:row-end-12",
  "13": "astralis:row-end-13",
  auto: "astralis:row-end-auto",
} as const;

/* ==========================================================================
   3. SHARED LAYOUT MAPPINGS (USED BY BOTH FLEX & GRID)
   ========================================================================== */

export const justifyContentTypes = {
  start: "astralis:justify-start",
  center: "astralis:justify-center",
  end: "astralis:justify-end",
  between: "astralis:justify-between",
  around: "astralis:justify-around",
  evenly: "astralis:justify-evenly",
} as const;

export const alignItemsTypes = {
  start: "astralis:items-start",
  center: "astralis:items-center",
  end: "astralis:items-end",
  baseline: "astralis:items-baseline",
  stretch: "astralis:items-stretch",
} as const;

export const alignContentTypes = {
  start: "astralis:content-start",
  center: "astralis:content-center",
  end: "astralis:content-end",
  between: "astralis:content-between",
  around: "astralis:content-around",
  evenly: "astralis:content-evenly",
  stretch: "astralis:content-stretch",
} as const;

export const placeContentTypes = {
  start: "astralis:place-content-start",
  center: "astralis:place-content-center",
  end: "astralis:place-content-end",
  between: "astralis:place-content-between",
  around: "astralis:place-content-around",
  evenly: "astralis:place-content-evenly",
  stretch: "astralis:place-content-stretch",
} as const;

export const placeItemsTypes = {
  start: "astralis:place-items-start",
  center: "astralis:place-items-center",
  end: "astralis:place-items-end",
  stretch: "astralis:place-items-stretch",
} as const;

export const alignSelfTypes = {
  auto: "astralis:self-auto",
  start: "astralis:self-start",
  end: "astralis:self-end",
  center: "astralis:self-center",
  stretch: "astralis:self-stretch",
  baseline: "astralis:self-baseline",
} as const;

export const justifySelfTypes = {
  auto: "astralis:justify-self-auto",
  start: "astralis:justify-self-start",
  end: "astralis:justify-self-end",
  center: "astralis:justify-self-center",
  stretch: "astralis:justify-self-stretch",
} as const;

export const placeSelfTypes = {
  auto: "astralis:place-self-auto",
  start: "astralis:place-self-start",
  end: "astralis:place-self-end",
  center: "astralis:place-self-center",
  stretch: "astralis:place-self-stretch",
} as const;

/* Channel prop: token -> CSS value via --astralis-order. first/last are the
   conventional extreme sentinels; none restores the initial 0. */
export const orderTypes = channelMap({
  "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6",
  "7": "7", "8": "8", "9": "9", "10": "10", "11": "11", "12": "12",
  first: "-9999",
  last: "9999",
  none: "0",
} as const);

/* Channel props: token -> CSS value on the spacing scale, delivered through
   --astralis-gap / --astralis-row-gap / --astralis-column-gap. */
export const gapTypes = GAP_SCALE;

export const rowGapTypes = GAP_SCALE;

export const columnGapTypes = GAP_SCALE;