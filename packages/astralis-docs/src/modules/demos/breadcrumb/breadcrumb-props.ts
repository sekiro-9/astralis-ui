import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with the breadcrumb component's types in astralis-ui. */
export const breadcrumbProps: PropRow[] = [
  {
    prop: "separator",
    type: `ReactNode`,
    default: `chevron`,
    description: "Glyph between items (rendered `aria-hidden`).",
  },
];
