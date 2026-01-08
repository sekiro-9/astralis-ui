import { createContext, useContext } from "react";
import type { TabsContextValue } from "./tabs.types";

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs components must be used inside <Tabs />");
  }
  return ctx;
}
