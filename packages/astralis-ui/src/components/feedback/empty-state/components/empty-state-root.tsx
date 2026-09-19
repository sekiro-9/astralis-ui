import type { EmptyStateProps } from "../empty-state.types";
import { emptyStateRoot } from "../empty-state.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";

/**
 * A blank-slate placeholder for "no results", "nothing here yet" and error
 * moments. Pure composition — the compound ships zero client JavaScript. Size
 * travels to the parts via `data-empty-state-size`, not context.
 */
export function EmptyStateRoot({ size = "md", className = "", children, ...rest }: EmptyStateProps) {
  const { placementClass, rest: domProps } = splitPlacement(rest);
  return (
    <div
      role="status"
      data-empty-state-size={size}
      className={astralisMerge(emptyStateRoot, placementClass, className)}
      {...domProps}
    >
      {children}
    </div>
  );
}

EmptyStateRoot.displayName = "EmptyState";
