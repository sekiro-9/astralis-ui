import { createContext, useContext } from "react";
import type { AccordionContextValue } from "./accordion.types";

export const AccordionContext = createContext<AccordionContextValue | null>(null)

export function useAccordionContext() {
    const ctx = useContext(AccordionContext)

    if(!ctx){
        throw new Error("Accordion components must be used within <Accordion.Root>")
    }

    return ctx
}

export const AccordionItemContext = createContext<{ value: string; disabled?: boolean } | null>(null)

export function useAccordionItemContext() {
  const ctx = useContext(AccordionItemContext)
  if (!ctx) {
    throw new Error('Accordion.Item must be used inside Accordion.Root')
  }
  return ctx
}
