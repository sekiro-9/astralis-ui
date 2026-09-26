import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/overlay/alert-dialog/alert-dialog.types.ts */
export const alertDialogProps: PropRow[] = [
  {
    prop: "open · defaultOpen · onOpenChange",
    type: "boolean · boolean · (open: boolean) => void",
    default: "None · false · None",
    description: "Controlled / initial state, and the change callback.",
  },
  {
    prop: "size",
    type: `"sm" | "md" | "lg" | "xl" | "full"`,
    default: `"md"`,
    description: "Panel width.",
  },
  {
    prop: "centered",
    type: "boolean",
    default: "true",
    description: "Centers the panel vertically.",
  },
  {
    prop: "closeOnOverlayClick",
    type: "boolean",
    default: "false",
    description: "Off by default, unlike Modal: the user has to choose an action.",
  },
  {
    prop: "closeOnEsc",
    type: "boolean",
    default: "true",
    description: "Escape cancels, as the ARIA pattern expects.",
  },
];

export const alertDialogPartsProps: PropRow[] = [
  {
    prop: "AlertDialog.Trigger / AlertDialog.Close",
    type: "children: ReactElement",
    description: "Wrap a single element, such as a Button, to open or to close the dialog.",
  },
  {
    prop: "AlertDialog.Content",
    type: "div props",
    description: "The portalled, focus-trapped panel.",
  },
  {
    prop: "AlertDialog.Header / Body / Footer",
    type: "children · className",
    description: "Layout regions. The Footer holds the actions that resolve the dialog.",
  },
  {
    prop: "AlertDialog.Title / AlertDialog.Description",
    type: "children · className",
    description: "Wired to aria-labelledby and aria-describedby.",
  },
];
