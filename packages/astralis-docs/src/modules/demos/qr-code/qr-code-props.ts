import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/data-display/qr-code/qr-code.types.ts */
export const qrCodeProps: PropRow[] = [
  {
    prop: "value",
    type: "string",
    description: "The text or URL to encode. Required.",
    control: { kind: "omit" },
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg" | "xl"`,
    default: `"md"`,
    description: "Preset sizes from 96 to 280px.",
  },
  {
    prop: "pixelSize",
    type: "number",
    description: "Explicit size in pixels, overriding the preset.",
    control: { kind: "omit" },
  },
  {
    prop: "errorLevel",
    type: `"L" | "M" | "Q" | "H"`,
    default: `"M"`,
    description: "Error correction, from 7% to 30% recoverable. Go higher when an overlay covers modules.",
  },
  {
    prop: "color / bgColor",
    type: "string",
    default: `"#000000" / "transparent"`,
    description: "CSS colors of the modules and the background.",
  },
  {
    prop: "overlay / overlaySize",
    type: "ReactNode / number",
    default: "None / 20",
    description: "A centered logo, sized as a percentage of the code.",
  },
  {
    prop: "status",
    type: `"active" | "loading" | "expired" | "scanned"`,
    default: `"active"`,
    description: "Lifecycle overlay.",
  },
  {
    prop: "onRefresh",
    type: "() => void",
    description: "Shows a Refresh button on the expired overlay.",
  },
  {
    prop: "downloadable",
    type: "boolean",
    default: "false",
    description: "Adds a button that downloads the code as an SVG.",
  },
  {
    prop: "downloadFileName",
    type: "string",
    default: `"qrcode"`,
    description: "File name for the download, without the extension.",
    control: { kind: "omit" },
  },
];
