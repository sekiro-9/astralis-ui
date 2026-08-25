import { useId } from "react";
import type { PopoutProps } from "../popout.types";
import { inheritProps } from "../../../../utils/inherit-props";
import { PopoutTrigger } from "./popout-parts";
import { PopoutContent } from "./popout-content";

/**
 * An anchored disclosure that ships ZERO JavaScript.
 *
 * The trigger is a real `<button popovertarget>`; the panel is a native
 * `[popover]` positioned by CSS anchor positioning through the IMPLICIT
 * anchor reference the invoker establishes (cross-engine since Firefox 147,
 * January 2026). The platform supplies what a JS popover engine used to:
 * top layer, light dismiss, Esc, focus return, and collision flipping via
 * position-try-fallbacks. Renders as a Server Component; nothing hydrates.
 *
 * Deliberately a DISCLOSURE, not a menu: there is no roving focus and no
 * menu ARIA, because those require state CSS cannot own. For an actions
 * menu with arrow-key navigation, use Menu — that is what it is for.
 *
 * `useId` pairs trigger and panel; it is one of the few hooks that runs in
 * Server Components, which is what keeps the whole compound server-side.
 */
export function PopoutRoot({ children }: PopoutProps) {
  const id = useId();
  return (
    <>
      {inheritProps(
        children,
        new Map<unknown, Record<string, unknown>>([
          [PopoutTrigger, { popoutId: id }],
          [PopoutContent, { popoutId: id }],
        ]),
      )}
    </>
  );
}

PopoutRoot.displayName = "Popout";
