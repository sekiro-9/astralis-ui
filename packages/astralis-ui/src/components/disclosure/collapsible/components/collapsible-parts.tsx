import type { Ref } from "react";
import type { CollapsibleTriggerProps, CollapsibleContentProps } from "../collapsible.types";
import {
  collapsibleTriggerClasses,
  collapsibleTriggerRowClasses,
  collapsibleIndicatorClasses,
  collapsibleContentClasses,
} from "../collapsible.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

/**
 * The `<summary>`. Keeps native `display: list-item` (hiding the marker via
 * `::marker` only) so screen readers keep announcing the expanded/collapsed
 * state — restyling summary to flex is the documented way to lose it. The
 * flex row lives on an inner span for that reason.
 */
export function CollapsibleTrigger({
  hideIndicator = false,
  className = "",
  children,
  ref,
  ...rest
}: CollapsibleTriggerProps & { ref?: Ref<HTMLElement> }) {
  return (
    <summary ref={ref} className={astralisMerge(collapsibleTriggerClasses, className)} {...rest}>
      <span className={collapsibleTriggerRowClasses}>
        <span className="astralis:min-w-0">{children}</span>
        {!hideIndicator && (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={astralisMerge("astralis:h-4 astralis:w-4", collapsibleIndicatorClasses)}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        )}
      </span>
    </summary>
  );
}

CollapsibleTrigger.displayName = "Collapsible.Trigger";

export function CollapsibleContent({
  className = "",
  children,
  ref,
  ...rest
}: CollapsibleContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={astralisMerge(collapsibleContentClasses, className)} {...rest}>
      {children}
    </div>
  );
}

CollapsibleContent.displayName = "Collapsible.Content";
