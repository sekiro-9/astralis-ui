import type { AccordionItemProps } from './accordion.types'
import { AccordionItemContext } from './accordion.context'

export function AccordionItem({
  value,
  disabled,
  children,
}: React.PropsWithChildren<AccordionItemProps>) {
  return (
    <AccordionItemContext.Provider value={{ value, disabled }}>
      <div data-accordion-item>{children}</div>
    </AccordionItemContext.Provider>
  )
}
