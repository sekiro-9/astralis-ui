import type { PropsWithChildren } from "react";
import { useTabsContext } from "./tabs.context";

export function TabsList({ children }: PropsWithChildren) {
  const { orientation } = useTabsContext();

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={[
        "astralis-flex",
        orientation === "horizontal"
          ? "astralis-flex-row astralis-gap-2"
          : "astralis-flex-col astralis-gap-1",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
