import { useAccordionContext, useAccordionItemContext } from './accordion.context'

export function AccordionTrigger(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { isItemOpen, toggleItem } = useAccordionContext()
  const { value, disabled } = useAccordionItemContext()

  const open = isItemOpen(value)

  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => toggleItem(value)}
      disabled={disabled}
      data-accordion-trigger
      {...props}
    />
  )
}
