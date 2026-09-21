import type { Ref } from "react";
import type { CollapsibleProps } from "../collapsible.types";
import { collapsibleRootClasses } from "../collapsible.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { identify } from "../../../../utils/dev-identity";

/**
 * A single disclosure that ships ZERO JavaScript: the open state is the
 * native `<details>` element's, toggling is the browser's, and Collapsibles
 * sharing a `name` form an exclusive accordion natively. Renders as a Server
 * Component; nothing hydrates. Uncontrolled by design — a controlled variant
 * would move the state into React and forfeit exactly the property this
 * component exists for.
 */
export const CollapsibleRoot = identify("Collapsible", function CollapsibleRoot({
  defaultOpen,
  className = "",
  children,
  ref,
  ...rest
}: CollapsibleProps & { ref?: Ref<HTMLDetailsElement> }) {
  const { placementClass, rest: domProps } = splitPlacement(rest);
  return (
    <details
      ref={ref}
      open={defaultOpen}
      className={astralisMerge(collapsibleRootClasses, placementClass, className)}
      {...domProps}
    >
      {children}
    </details>
  );
});
