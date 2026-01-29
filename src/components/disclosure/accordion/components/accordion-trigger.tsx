// accordion-trigger.tsx
import { useAccordionContext } from "../accordion.context";

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
      className={`
          astralis-w-full astralis-flex astralis-items-center astralis-justify-between 
          astralis-gap-3 astralis-px-4 astralis-py-3 astralis-text-left 
          astralis-font-medium focus:astralis-outline-none 
          astralis-bg-surface-raised
          ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
