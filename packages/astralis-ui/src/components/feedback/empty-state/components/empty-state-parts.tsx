import type { EmptyStatePartProps } from "../empty-state.types";
import {
  emptyStateIndicator,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateActions,
} from "../empty-state.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";

/** The icon (or illustration) slot — a muted circle that scales with the root's size. */
export function EmptyStateIndicator({ className = "", ...rest }: EmptyStatePartProps) {
  return <div aria-hidden="true" className={astralisMerge(emptyStateIndicator, className)} {...rest} />;
}

EmptyStateIndicator.displayName = "EmptyState.Indicator";

export function EmptyStateTitle({ className = "", ...rest }: EmptyStatePartProps) {
  return <div className={astralisMerge(emptyStateTitle, className)} {...rest} />;
}

EmptyStateTitle.displayName = "EmptyState.Title";

export function EmptyStateDescription({ className = "", ...rest }: EmptyStatePartProps) {
  return <div className={astralisMerge(emptyStateDescription, className)} {...rest} />;
}

EmptyStateDescription.displayName = "EmptyState.Description";

/** Call-to-action row under the copy — typically a Button or two. */
export function EmptyStateActions({ className = "", ...rest }: EmptyStatePartProps) {
  return <div className={astralisMerge(emptyStateActions, className)} {...rest} />;
}

EmptyStateActions.displayName = "EmptyState.Actions";
