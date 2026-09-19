import { cloneElement, isValidElement, type ReactElement, type ReactNode, type Ref } from "react";
import { resolveServerChild } from "../../utils/resolve-server-child";

/** The single element a Trigger or Close part wraps and augments. */
export type SlotElement = ReactElement<Record<string, unknown>>;

export function resolveSlotChild(children: ReactNode): SlotElement {
  const child = resolveServerChild(children);
  // The spec generator reads this wording to measure a slot part's content as
  // "element"; keep "must be a React element" in it.
  if (!isValidElement(child)) {
    throw new Error("A Trigger or Close part wraps one child, and it must be a React element, such as a Button.");
  }
  return child as SlotElement;
}

/** The ref the consumer put on the wrapped element (a prop in React 19). */
export function slotChildRef<T>(child: SlotElement): Ref<T> | undefined {
  return child.props.ref as Ref<T> | undefined;
}

type AnyHandler = (...args: unknown[]) => void;

/**
 * Clones the wrapped element with the slot's own props on top. `on*` handlers
 * compose instead of replacing: the element's own runs first, then the one
 * given to the slot part, then the component's. Pass an already merged `ref`
 * in `own`; everything else in `own` wins over the slot's and element's props.
 */
export function cloneSlot(
  child: SlotElement,
  slotProps: Record<string, unknown>,
  own: Record<string, unknown>,
): ReactElement {
  const props: Record<string, unknown> = { ...slotProps, ...own };
  for (const key of new Set([...Object.keys(slotProps), ...Object.keys(own)])) {
    if (!/^on[A-Z]/.test(key)) continue;
    const chain = [child.props[key], slotProps[key], own[key]].filter(
      (fn): fn is AnyHandler => typeof fn === "function",
    );
    if (chain.length > 1) props[key] = (...args: unknown[]) => chain.forEach((fn) => fn(...args));
  }
  return cloneElement(child, props);
}
