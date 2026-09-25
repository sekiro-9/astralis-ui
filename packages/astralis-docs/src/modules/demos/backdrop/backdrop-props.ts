import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/overlay/backdrop/backdrop.tsx */
export const backdropProps: PropRow[] = [
  {
    prop: "blur",
    type: "boolean",
    default: "true",
    description: "Frosts the content behind the scrim.",
  },
  {
    prop: "children",
    type: "ReactNode",
    description: "Centered on the scrim, such as a Loader or a message.",
  },
  {
    prop: "style",
    type: "CSSProperties",
    description: "backgroundColor replaces the scrim color; position scopes it to a frame.",
  },
];
