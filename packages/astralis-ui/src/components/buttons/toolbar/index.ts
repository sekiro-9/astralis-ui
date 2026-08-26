import { ToolbarRoot, ToolbarGroup, ToolbarSeparator } from "./components/toolbar";

// 1️⃣ Compound API
export const Toolbar = Object.assign(ToolbarRoot, {
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
});

// 2️⃣ Flat exports
export { ToolbarGroup, ToolbarSeparator };

// 3️⃣ Type exports
export type { ToolbarProps, ToolbarGroupProps, ToolbarOrientation } from "./toolbar.types";
