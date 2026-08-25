import type { Ref } from "react";
import type { CollapsibleProps } from "../collapsible.types";
import { collapsibleRootClasses } from "../collapsible.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

/**
 * A single disclosure that ships ZERO JavaScript: the open state is the
 * native `<details>` element's, toggling is the browser's, and Collapsibles
 * sharing a `name` form an exclusive accordion natively. Renders as a Server
 * Component; nothing hydrates. Uncontrolled by design — a controlled variant
 * would move the state into React and forfeit exactly the property this
 * component exists for.
 */
export function CollapsibleRoot({
  defaultOpen,
  className = "",
  children,
  ref,
  ...rest
}: CollapsibleProps & { ref?: Ref<HTMLDetailsElement> }) {
  return (
    <details
      ref={ref}
      open={defaultOpen}
      className={astralisMerge(collapsibleRootClasses, className)}
      {...rest}
    >
      {children}
    </details>
  );
}

CollapsibleRoot.displayName = "Collapsible";
