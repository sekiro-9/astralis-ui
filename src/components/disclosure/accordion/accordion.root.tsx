import { useCallback, useMemo, useState } from "react";
import { AccordionContext } from "./accordion.context";
import type { AccordionRootProps } from "./accordion.types";

export function AccordionRoot(
  props: React.PropsWithChildren<AccordionRootProps>
) {
  const {
    children,
    type = "single",
    value: valueProp,
    defaultValue,
    collapsible = false,
    disabled,
    onValueChange,
  } = props;

  const [internalValue, setInternalValue] = useState(
    defaultValue ?? (type === "multiple" ? [] : "")
  );

  const value = valueProp ?? internalValue;

  const isItemOpen = useCallback(
    (itemValue: string) =>
      type === "multiple"
        ? Array.isArray(value) && value.includes(itemValue)
        : value === itemValue,
    [type, value]
  );

  const toggleItem = useCallback(
    (itemValue: string) => {
      if (disabled) return;

      let nextValue: string | string[];

      if (type === "multiple") {
        const values = Array.isArray(value) ? value : [];
        nextValue = values.includes(itemValue)
          ? values.filter((v) => v !== itemValue)
          : [...values, itemValue];
      } else {
        nextValue =
          value === itemValue ? (collapsible ? "" : value) : itemValue;
      }

      setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [type, value, collapsible, disabled, onValueChange]
  );

  const context = useMemo(
    () => ({
      type,
      value,
      collapsible,
      disabled,
      isItemOpen,
      toggleItem,
    }),
    [type, value, collapsible, disabled, isItemOpen, toggleItem]
  );

  return (
    <AccordionContext.Provider value={context}>
      <div data-accordion-root>{children}</div>
    </AccordionContext.Provider>
  );
}
