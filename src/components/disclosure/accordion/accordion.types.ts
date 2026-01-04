export type AccordionType = "single" | "multiple";

export interface AccordionRootProps {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  collapsible?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string | string[]) => void;
}

export interface AccordionItemProps {
  value: string
  disabled?: boolean
}

export interface AccordionContextValue {
  type: AccordionType
  value: string | string[]
  disabled?: boolean
  collapsible?: boolean
  isItemOpen: (value: string) => boolean
  toggleItem: (value: string) => void
}