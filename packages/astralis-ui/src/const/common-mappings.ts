import { channelMap } from "./channel";

export const displayTypes = {
  inline: "astralis:inline",
  block: "astralis:block",
  "inline-block": "astralis:inline-block",
  "flow-root": "astralis:flow-root",
  flex: "astralis:flex",
  "inline-flex": "astralis:inline-flex",
  grid: "astralis:grid",
  "inline-grid": "astralis:inline-grid",
  contents: "astralis:contents",
  table: "astralis:table",
  "inline-table": "astralis:inline-table",
  "table-caption": "astralis:table-caption",
  "table-cell": "astralis:table-cell",
  "table-column": "astralis:table-column",
  "table-column-group": "astralis:table-column-group",
  "table-footer-group": "astralis:table-footer-group",
  "table-header-group": "astralis:table-header-group",
  "table-row-group": "astralis:table-row-group",
  "table-row": "astralis:table-row",
  "list-item": "astralis:list-item",
  hidden: "astralis:hidden",
} as const;

/* Channel prop (const/channel.ts): token -> CSS value via --astralis-opacity. */
export const opacityTypes = channelMap({
  lowest: "var(--astralis-opacity-lowest)",
  lower: "var(--astralis-opacity-lower)",
  low: "var(--astralis-opacity-low)",
  moderate: "var(--astralis-opacity-moderate)",
  high: "var(--astralis-opacity-high)",
  higher: "var(--astralis-opacity-higher)",
  highest: "var(--astralis-opacity-highest)",
  max: "var(--astralis-opacity-max)",
} as const);

export const zIndexTypes = {
  lowest: "astralis:z-lowest",
  lower: "astralis:z-lower",
  low: "astralis:z-low",
  moderate: "astralis:z-moderate",
  high: "astralis:z-high",
  higher: "astralis:z-higher",
  highest: "astralis:z-highest",
  max: "astralis:z-max",
} as const;

export const positionTypes = {
  static: "astralis:static",
  fixed: "astralis:fixed",
  absolute: "astralis:absolute",
  relative: "astralis:relative",
  sticky: "astralis:sticky",
} as const;

export const borderWidthTypes = {
  normal: "astralis:border-normal",
  moderate: "astralis:border-moderate",
  thick: "astralis:border-thick",
  thicker: "astralis:border-thicker",
  thickest: "astralis:border-thickest",
} as const;

/* Per-side border widths, mirroring the rounded family. A header rule or a
   table divider is a one-sided border; `border` alone cannot say that. */
export const borderTWidthTypes = {
  normal: "astralis:border-t-normal",
  moderate: "astralis:border-t-moderate",
  thick: "astralis:border-t-thick",
  thicker: "astralis:border-t-thicker",
  thickest: "astralis:border-t-thickest",
} as const;

export const borderRWidthTypes = {
  normal: "astralis:border-r-normal",
  moderate: "astralis:border-r-moderate",
  thick: "astralis:border-r-thick",
  thicker: "astralis:border-r-thicker",
  thickest: "astralis:border-r-thickest",
} as const;

export const borderBWidthTypes = {
  normal: "astralis:border-b-normal",
  moderate: "astralis:border-b-moderate",
  thick: "astralis:border-b-thick",
  thicker: "astralis:border-b-thicker",
  thickest: "astralis:border-b-thickest",
} as const;

export const borderLWidthTypes = {
  normal: "astralis:border-l-normal",
  moderate: "astralis:border-l-moderate",
  thick: "astralis:border-l-thick",
  thicker: "astralis:border-l-thicker",
  thickest: "astralis:border-l-thickest",
} as const;


export const borderStyleTypes = {
  solid: "astralis:border-solid",
  dashed: "astralis:border-dashed",
  dotted: "astralis:border-dotted",
  double: "astralis:border-double",
  hidden: "astralis:border-hidden",
  none: "astralis:border-none",
} as const;

/* Channel prop: token -> CSS value via --astralis-shadow. `inner` rides the
   dedicated inset token (shadow.css declares both tiers, light + dark). */
export const shadowTypes = channelMap({
  none: "var(--astralis-shadow-none)",
  xs: "var(--astralis-shadow-xs)",
  sm: "var(--astralis-shadow-sm)",
  md: "var(--astralis-shadow-md)",
  lg: "var(--astralis-shadow-lg)",
  xl: "var(--astralis-shadow-xl)",
  "2xl": "var(--astralis-shadow-2xl)",
  inner: "var(--astralis-shadow-inner)",
} as const);

export const overflowTypes = {
  auto: "astralis:overflow-auto",
  hidden: "astralis:overflow-hidden",
  visible: "astralis:overflow-visible",
  scroll: "astralis:overflow-scroll",
  clip: "astralis:overflow-clip",
} as const;

export const overflowXTypes = {
  auto: "astralis:overflow-x-auto",
  hidden: "astralis:overflow-x-hidden",
  visible: "astralis:overflow-x-visible",
  scroll: "astralis:overflow-x-scroll",
  clip: "astralis:overflow-x-clip",
} as const;

export const overflowYTypes = {
  auto: "astralis:overflow-y-auto",
  hidden: "astralis:overflow-y-hidden",
  visible: "astralis:overflow-y-visible",
  scroll: "astralis:overflow-y-scroll",
  clip: "astralis:overflow-y-clip",
} as const;

export const cursorTypes = {
  auto: "astralis:cursor-auto",
  default: "astralis:cursor-default",
  pointer: "astralis:cursor-pointer",
  wait: "astralis:cursor-wait",
  text: "astralis:cursor-text",
  move: "astralis:cursor-move",
  help: "astralis:cursor-help",
  progress: "astralis:cursor-progress",
  "not-allowed": "astralis:cursor-not-allowed",
  grab: "astralis:cursor-grab",
  grabbing: "astralis:cursor-grabbing",
  none: "astralis:cursor-none",
} as const;

export const pointerEventsTypes = {
  none: "astralis:pointer-events-none",
  auto: "astralis:pointer-events-auto",
} as const;

export const aspectRatioTypes = {
  auto: "astralis:aspect-auto",
  square: "astralis:aspect-square",
  landscape: "astralis:aspect-landscape",
  portrait: "astralis:aspect-portrait",
  wide: "astralis:aspect-wide",
  ultrawide: "astralis:aspect-ultrawide",
  golden: "astralis:aspect-golden",
} as const;
