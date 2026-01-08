import type { AccordionItemProps } from "../accordion.types";

export function AccordionItem({
  children,
  disabled,
}: React.PropsWithChildren<AccordionItemProps>) {
  return (
    <div
      className={`astralis-w-full astralis-border astralis-border-secondary-200 astralis-rounded-lg astralis-overflow-hidden ${
        disabled ? "astralis-opacity-50" : ""
      }`}
    >
      {children}
    </div>
  );
}
