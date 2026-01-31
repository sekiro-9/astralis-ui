import type { TabsContentProps } from "../tabs.types";
import { useTabs } from "../tabs.context";

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: activeValue, orientation } = useTabs();

  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      data-state="active"
      data-orientation={orientation}
      className={[
        "astralis-flex-1 astralis-w-full astralis-outline-none focus-visible:astralis-ring-2 focus-visible:astralis-ring-primary-500",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
