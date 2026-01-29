// accordion-indicator.tsx
import { Icon } from "../../../icon";
import { useAccordionContext } from "../accordion.context";

interface AccordionIndicatorProps {
  value: string;
  className?: string;
}

export function AccordionIndicator({
  value,
  className = "",
}: AccordionIndicatorProps) {
  const { isOpen } = useAccordionContext();
  const open = isOpen(value);

  return (
    <Icon
      name="ChevronDown"
      size="sm"
      className={`astralis-transition-transform astralis-text-content-primary astralis-duration-200 ${
        open ? "astralis-rotate-180" : ""
      } ${className}`}
      aria-hidden
    />
  );
}
