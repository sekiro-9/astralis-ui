import type { PropsWithChildren } from "react";
import { useTabsContext } from "./tabs.context";

interface TabsContentProps {
  value: string;
}

export function TabsContent({
  value,
  children,
}: PropsWithChildren<TabsContentProps>) {
  const { value: activeValue } = useTabsContext();

  if (activeValue !== value) return null;

  return (
    <div role="tabpanel" className="astralis-pt-3">
      {children}
    </div>
  );
}
