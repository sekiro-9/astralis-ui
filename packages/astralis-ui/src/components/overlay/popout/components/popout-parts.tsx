import type { Ref } from "react";
import type { PopoutTriggerProps } from "../popout.types";
import { popoutTriggerClasses } from "../popout.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

/**
 * The invoker: a real `<button popovertarget>`. Declarative invocation is
 * what buys zero JS — and it also establishes the implicit CSS anchor the
 * panel positions against. Supporting browsers expose the expanded state to
 * assistive tech from the popovertarget relation itself.
 */
export const PopoutTrigger = identify("Popout.Trigger", function PopoutTrigger({
  popoutId,
  className = "",
  children,
  ref,
  ...rest
}: PopoutTriggerProps & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      type="button"
      popoverTarget={popoutId}
      className={astralisMerge(popoutTriggerClasses, className)}
      {...rest}
    >
      {children}
    </button>
  );
});
