// accordion-content.tsx
import { useAccordionContext } from "../accordion.context";

interface AccordionContentProps {
  value: string;
}

export function AccordionContent({
  value,
  children,
}: React.PropsWithChildren<AccordionContentProps>) {
  const { isOpen } = useAccordionContext();

  if (!isOpen(value)) return null;

  return (
    <div className="astralis-w-full astralis-p-4 astralis-text-secondary-700">
      {children}
    </div>
  );
}
