import { useState } from "react";
import AccordionContext from "../accordion.context";
import type { AccordionProps } from "../accordion.types";

export function AccordionRoot({
  children,
  type = "single",
  value,
  defaultValue,
  collapsible = false,
  onValueChange,
}: React.PropsWithChildren<AccordionProps>) {
  const [internalValue, setInternalValue] = useState<
    string | string[] | undefined
  >(defaultValue);

  const currentValue = value ?? internalValue;

  const isOpen = (item: string) => {
    if (type === "multiple") {
      return Array.isArray(currentValue) && currentValue.includes(item);
    }
    return currentValue === item;
  };

  const toggle = (item: string) => {
    let nextValue: string | string[];

    if (type === "multiple") {
      const values = Array.isArray(currentValue) ? currentValue : [];
      nextValue = values.includes(item)
        ? values.filter((v) => v !== item)
        : [...values, item];
    } else {
      if (currentValue === item && collapsible) {
        nextValue = "";
      } else {
        nextValue = item;
      }
    }

    setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <AccordionContext.Provider value={{ isOpen, toggle }}>
      <div className="astralis-w-full astralis-min-w-[500px] astralis-space-y-2">{children}</div>
    </AccordionContext.Provider>
  );
}
