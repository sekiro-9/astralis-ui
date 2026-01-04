import { useAccordionContext, useAccordionItemContext } from "./accordion.context";

export function AccordionContent({ children }: React.PropsWithChildren) {
  const { isItemOpen } = useAccordionContext();
  const { value } = useAccordionItemContext();

  if (!isItemOpen(value)) return null;

  return (
    <div role="region" data-accordion-content>
      {children}
    </div>
  );
}
