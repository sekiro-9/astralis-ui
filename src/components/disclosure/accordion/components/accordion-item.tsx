import type { AccordionItemProps } from "../accordion.types";

export function AccordionItem({
  children,
  disabled,
}: React.PropsWithChildren<AccordionItemProps>) {
  return (
    <div
      className={`astralis-w-full astralis-bg astralis-border astralis-border-border-subtle astralis-rounded-lg astralis-overflow-hidden ${
        disabled ? "astralis-opacity-50" : ""
      }`}
    >
      {children}
    </div>
  );
}
