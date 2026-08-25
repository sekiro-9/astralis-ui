import type { HTMLAttributes, ReactNode } from "react";

export interface CollapsibleProps extends HTMLAttributes<HTMLDetailsElement> {
  /** Open on first render. Uncontrolled by design — the OPEN STATE lives in
   *  the browser (`<details>`), which is what makes this component zero-JS. */
  defaultOpen?: boolean;
  /**
   * Exclusive-group name: Collapsibles sharing a `name` behave as an
   * accordion — opening one closes its siblings — with no JavaScript, via the
   * native `<details name>` attribute.
   */
  name?: string;
  children?: ReactNode;
}

export interface CollapsibleTriggerProps extends HTMLAttributes<HTMLElement> {
  /** Hide the built-in chevron (e.g. when composing your own indicator). */
  hideIndicator?: boolean;
  children?: ReactNode;
}

export type CollapsibleContentProps = HTMLAttributes<HTMLDivElement>;
