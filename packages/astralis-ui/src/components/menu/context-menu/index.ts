import { ContextMenuRoot, ContextMenuTrigger } from "./components/context-menu-root";
import { MenuContent } from "../components/menu-content";
import { MenuItem, MenuLabel, MenuSeparator, MenuGroup } from "../components/menu-parts";

/**
 * Compound API — the parts ARE Menu's parts (same context, same styling);
 * only the trigger differs: right-click, anchored at the pointer.
 */
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Label: MenuLabel,
  Separator: MenuSeparator,
  Group: MenuGroup,
});

export type { ContextMenuProps, ContextMenuTriggerProps } from "./context-menu.types";
