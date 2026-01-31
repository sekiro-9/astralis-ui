import { createContext, useContext } from "react";

interface TabsContextValue {
  value?: string;
  setValue: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  loop?: boolean;
}

export const TabsContext = createContext<TabsContextValue | undefined>(
  undefined,
);

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return context;
}
