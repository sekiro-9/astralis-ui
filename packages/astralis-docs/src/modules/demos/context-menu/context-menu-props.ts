import type { PropRow } from "@/modules/docs/props-table";

/** Keep in sync with packages/astralis-ui/src/components/menu/context-menu/context-menu.types.ts */
export const contextMenuProps: PropRow[] = [
  {
    prop: "open · defaultOpen · onOpenChange",
    type: "boolean · boolean · (open: boolean) => void",
    default: "None · false · None",
    description: "Controlled / initial state, and the change callback.",
  },
  {
    prop: "sideOffset",
    type: "number",
    default: "2",
    description: "Gap between the pointer and the menu, in pixels.",
  },
  {
    prop: "closeOnSelect",
    type: "boolean",
    default: "true",
    description: "Closes the menu after an item is activated.",
  },
];

export const contextMenuPartsProps: PropRow[] = [
  {
    prop: "ContextMenu.Trigger",
    type: "children: ReactElement",
    description: "Wraps the element that opens the menu on right-click. Make it focusable for keyboard users.",
  },
  {
    prop: "ContextMenu.Content / Item / Label / Separator / Group",
    type: "as on Menu",
    description: "Identical to Menu's parts, including Item's onSelect, icon, shortcut and danger.",
  },
];
