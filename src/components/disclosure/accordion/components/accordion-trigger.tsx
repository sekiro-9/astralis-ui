// accordion-trigger.tsx
import { useAccordionContext } from "../accordion.context";

interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function AccordionTrigger({
  value,
  children,
  className = "",
  ...props
}: AccordionTriggerProps) {
  const { isOpen, toggle } = useAccordionContext();
  const open = isOpen(value);

  return (
    <button
      type="button"
      onClick={() => toggle(value)}
      aria-expanded={open}
      className={`astralis-w-full astralis-border astralis-border-secondary-200 astralis-flex astralis-items-center astralis-justify-between astralis-gap-3 astralis-px-4 astralis-py-3 astralis-text-left astralis-font-medium hover:astralis-bg-secondary-100 focus:astralis-outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
