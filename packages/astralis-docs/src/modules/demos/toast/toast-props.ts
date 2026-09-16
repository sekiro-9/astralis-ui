import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";

/** Keep in sync with packages/astralis-ui/src/components/feedback/toast/toast.types.ts */
export const toasterProps: PropRow[] = [
  {
    prop: "placement",
    type: `"top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end"`,
    default: `"bottom-end"`,
    description: "The screen corner or edge the stack grows from.",
  },
  {
    prop: "max",
    type: "number",
    default: "5",
    description: "How many toasts show at once, newest first. The rest wait their turn.",
  },
];

/** The options object `toast()` takes; not a component, so no playground. */
export const toastOptionsProps: PropRow[] = [
  {
    prop: "title",
    type: "ReactNode",
    description: "The headline. Required.",
  },
  {
    prop: "description",
    type: "ReactNode",
    description: "Supporting copy.",
  },
  {
    prop: "status",
    type: `"info" | "success" | "warning" | "error"`,
    default: `"info"`,
    description: "Picks the icon and hue, and whether the announcement is polite or assertive.",
  },
  {
    prop: "colorScheme",
    type: COLOR_SCHEME_TYPE,
    default: "from status",
    description: "Hue override.",
  },
  {
    prop: "duration",
    type: "number | null",
    default: "5000",
    description: "Auto-dismiss delay in ms; null keeps the toast until it's dismissed.",
  },
  {
    prop: "closable",
    type: "boolean",
    default: "true",
    description: "Shows the dismiss button and lets Escape dismiss the focused toast.",
  },
  {
    prop: "action",
    type: "{ label: string; onClick: () => void }",
    description: "A button after the text.",
  },
];
