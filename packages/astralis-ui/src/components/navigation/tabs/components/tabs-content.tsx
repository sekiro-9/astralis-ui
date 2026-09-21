"use client";

import { astralisMerge } from "../../../../utils/astralis-merge";
import { tabsPartId, useTabsContext } from "../tabs.context";
import { tabsContentVariants } from "../tabs.styles";
import type { TabsContentProps } from "../tabs.types";
import { identify } from "../../../../utils/dev-identity";

/**
 * Tabs.Content — the panel for one tab. Unmounted when inactive, unless the Root
 * sets `keepMounted` (then it stays mounted but `hidden`, preserving its state).
 */
export const TabsContent = identify("Tabs.Content", function TabsContent({ value, className, children, ...rest }: TabsContentProps) {
  const { value: active, keepMounted, baseId } = useTabsContext();
  const isActive = value === active;

  if (!isActive && !keepMounted) return null;

  return (
    <div
      id={tabsPartId(baseId, "panel", value)}
      role="tabpanel"
      aria-labelledby={tabsPartId(baseId, "trigger", value)}
      tabIndex={0}
      hidden={!isActive}
      data-state={isActive ? "active" : "inactive"}
      className={astralisMerge(tabsContentVariants(), className)}
      {...rest}
    >
      {children}
    </div>
  );
});
