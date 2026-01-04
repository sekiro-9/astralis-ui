import { useAccordionContext, useAccordionItemContext } from './accordion.context'

export function AccordionIndicator() {
  const { isItemOpen } = useAccordionContext()
  const { value } = useAccordionItemContext()

  return (
    <span
      aria-hidden
      data-accordion-indicator
      data-open={isItemOpen(value)}
    >
      ▾
    </span>
  )
}
