import { useState } from "react";
import { TabsContext } from "./tabs.context";
import type { TabsProps } from "./tabs.types";

export function Tabs({
  value,
  defaultValue,
  onChange,
  orientation = "horizontal",
  size = "md",
  children,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  return (
    <TabsContext.Provider
      value={{
        value: activeValue,
        orientation,
        size,
        setValue,
      }}
    >
      <div className="astralis-flex astralis-flex-col astralis-gap-3">
        {children}
      </div>
    </TabsContext.Provider>
  );
}
