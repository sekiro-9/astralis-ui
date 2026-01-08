import { createContext, useContext } from "react";

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error("Accordion components must be used within <Accordion />");
  }
  return ctx;
}

export default AccordionContext;
