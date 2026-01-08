import { AccordionRoot } from "./components/accordion-root";
import { AccordionItem } from "./components/accordion-item";
import { AccordionTrigger } from "./components/accordion-trigger";
import { AccordionContent } from "./components/accordion-content";
import { AccordionIndicator } from "./components/accordion-indicator";

// 1️⃣ Compound DX API
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Conten: AccordionContent,
  Indicator: AccordionIndicator,
});

// 2️⃣ Flat exports for tree-shaking
export {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionIndicator,
};

// 3️⃣ Type exports
export type { AccordionProps, AccordionItemProps } from "./accordion.types";
