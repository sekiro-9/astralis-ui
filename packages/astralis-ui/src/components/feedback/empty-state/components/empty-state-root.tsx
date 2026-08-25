import type { EmptyStateProps } from "../empty-state.types";
import { emptyStateRoot } from "../empty-state.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

/**
 * A blank-slate placeholder for "no results", "nothing here yet" and error
 * moments. Pure composition — the compound ships zero client JavaScript. Size
 * travels to the parts via `data-empty-state-size`, not context.
 */
export function EmptyStateRoot({ size = "md", className = "", children, ...rest }: EmptyStateProps) {
  return (
    <div
      role="status"
      data-empty-state-size={size}
      className={astralisMerge(emptyStateRoot, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

EmptyStateRoot.displayName = "EmptyState";
