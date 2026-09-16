import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/icon/icon.types.ts */
export const iconProps: PropRow[] = [
  {
    prop: "as",
    type: "ElementType",
    description: "An icon component to render, such as one from Lucide.",
  },
  {
    prop: "children",
    type: "ReactNode",
    description: "Or a raw svg element, which fills the sized wrapper.",
  },
  {
    prop: "size",
    type: `"xs" | "sm" | "md" | "lg" | "xl" | number`,
    default: `"md"`,
    description: "A size token, or an explicit size in pixels.",
    control: { kind: "chips", options: ["xs", "sm", "md", "lg", "xl"] },
  },
  {
    prop: "color",
    type: "text color token | CSS color",
    description: "Omit it and the icon inherits the surrounding text color through currentColor.",
    control: { kind: "chips", options: ["base", "muted", "subtle"] },
  },
  {
    prop: "strokeWidth",
    type: "number",
    description: "Passed to icon components drawn with strokes. Has no effect on raw svg children.",
    control: { kind: "omit" },
  },
];
