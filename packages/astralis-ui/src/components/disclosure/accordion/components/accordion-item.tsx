"use client";

import { useId, useMemo } from "react";
import { useAccordion, AccordionItemContext } from "../accordion.context";
import { accordionItemVariants } from "../accordion.styles";
import type { AccordionItemProps } from "../accordion.types";
import { astralisMerge } from "../../../../utils/astralis-merge";

export function AccordionItem({ children, value, disabled = false, className = "", ...rest }: AccordionItemProps) {
  const { variant, isOpen, disabled: rootDisabled } = useAccordion();
  // Generated, never built from `value`: a value with a space or quote would
  // break aria-controls and aria-labelledby.
  const itemId = useId();

  const itemDisabled = disabled || rootDisabled;
  const open = isOpen(value);

  const ctx = useMemo(
    () => ({
      value,
      open,
      disabled: itemDisabled,
      triggerId: `${itemId}-trigger`,
      contentId: `${itemId}-content`,
    }),
    [value, open, itemDisabled, itemId],
  );

  return (
    <AccordionItemContext.Provider value={ctx}>
      <div
        data-state={open ? "open" : "closed"}
        data-disabled={itemDisabled ? "" : undefined}
        className={astralisMerge(accordionItemVariants({ variant, disabled: itemDisabled }), className)}
        {...rest}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

AccordionItem.displayName = "Accordion.Item";
