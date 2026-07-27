import type { PropRow } from "@/modules/docs/props-table";

/**
 * Box exposes ~50 style props; documenting them as families keeps the table
 * readable. Keep in sync with box.styles.ts boxVariantMap.
 */
export const boxProps: PropRow[] = [
  {
    prop: "p · px · py · pt/pb/pl/pr",
    type: `"0.5" – "96" (spacing scale)`,
    description: "Padding — all sides, per axis, or per edge.",
  },
  {
    prop: "m · mx · my · mt/mb/ml/mr",
    type: `"0.5" – "96" (spacing scale)`,
    description: "Margin — all sides, per axis, or per edge.",
  },
  {
    prop: "w · h · size · minW/maxW · minH/maxH",
    type: `spacing scale | "xs"–"8xl" | fractions | "auto" | "full" | "fit" | "prose" …`,
    description: "Sizing. size sets width and height at once.",
  },
  {
    prop: "bg",
    type: `"base" | "subtle" | "muted" | "raised" | "inverted" | "{hue}" (solid) | "{hue}-subtle" | "{hue}-muted" | "{hue}-50"–"{hue}-950"`,
    description:
      "Background from semantic roles, palette roles, or raw shades. Transparent by default. base is the page, subtle the thing sitting on it, muted a filled control; raised is for floating layers only.",
  },
  {
    prop: "color",
    type: `"base" | "muted" | "subtle" | "inverted" | "{hue}" (label) | "{hue}-solid" | "{hue}-contrast"`,
    description: "Text color token; children inherit it.",
  },
  {
    prop: "border · borderStyle · borderColor",
    type: `"normal"–"thickest" · CSS styles · "base" | "subtle" | "muted" | "{hue}" (stroke)`,
    description: "Border width, style and color tokens.",
  },
  {
    prop: "rounded (+ roundedT/R/B/L, corner variants)",
    type: `"none" | "2xs"–"4xl" | "full"`,
    description: "Corner radius — all corners, per side, or per corner.",
  },
  {
    prop: "display",
    type: `"block" | "flex" | "grid" | "hidden" | …`,
    description: "CSS display.",
  },
  {
    prop: "position · inset · top/right/bottom/left · zIndex",
    type: "position tokens + offset scale",
    description: "Positioning.",
  },
  {
    prop: "shadow",
    type: `"none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "inner"`,
    description: "Box shadow token.",
  },
  {
    prop: "opacity · overflow(X/Y) · cursor · pointerEvents · aspectRatio",
    type: "token maps",
    description: "Misc utilities, all typed.",
  },
  {
    prop: "basis · flex · grow · shrink · order · alignSelf",
    type: `sizing scale · "1" | "auto" | "initial" | "none" · boolean | "0" | "1" · "1"–"12" · "auto" | "start" | "center" | "end" | "stretch" | "baseline"`,
    description:
      "How the element behaves as a child of a flex or grid parent. On Box, so any primitive can size itself without a Flex.Item wrapper.",
  },
  {
    prop: "as",
    type: "ElementType",
    default: `"div"`,
    description: "Element or component to render; HTML props follow it type-safely.",
  },
];
