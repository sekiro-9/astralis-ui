import { Tabs as TabsRoot } from "./tabs";
import { TabsList } from "./tabs-list";
import { TabsTrigger } from "./tabs-trigger";
import { TabsContent } from "./tabs-content";

// 1️⃣ Compound DX API
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

// 2️⃣ Flat exports for tree-shaking
export {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
};

export type { TabsProps } from "./tabs.types";
