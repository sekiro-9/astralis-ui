import { useCallback, useState } from "react";
import { TabsContext } from "../tabs.context";
import type { TabsProps } from "../tabs.types";

export function TabsRoot({
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  loop = true,
  className,
  children,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const value = controlledValue ?? uncontrolledValue;

  const setValue = useCallback(
    (next: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, setValue, orientation, loop }}>
      <div
        data-orientation={orientation}
        className={[
          "astralis-flex astralis-gap-4",
          orientation === "horizontal"
            ? "astralis-flex-col"
            : "astralis-flex-row",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}
