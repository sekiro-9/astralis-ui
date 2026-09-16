import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/overlay/portal.tsx */
export const portalProps: PropRow[] = [
  {
    prop: "children",
    type: "ReactNode",
    description: "The content to render elsewhere.",
  },
  {
    prop: "container",
    type: "HTMLElement",
    default: "document.body",
    description: "The element to render into.",
  },
];
