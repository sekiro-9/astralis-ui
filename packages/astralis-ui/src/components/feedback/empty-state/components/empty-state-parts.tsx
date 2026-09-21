import type { EmptyStatePartProps } from "../empty-state.types";
import {
  emptyStateIndicator,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateActions,
} from "../empty-state.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { identify } from "../../../../utils/dev-identity";

/** The icon (or illustration) slot — a muted circle that scales with the root's size. */
export const EmptyStateIndicator = identify("EmptyState.Indicator", function EmptyStateIndicator({ className = "", ...rest }: EmptyStatePartProps) {
  return <div aria-hidden="true" className={astralisMerge(emptyStateIndicator, className)} {...rest} />;
});

export const EmptyStateTitle = identify("EmptyState.Title", function EmptyStateTitle({ className = "", ...rest }: EmptyStatePartProps) {
  return <div className={astralisMerge(emptyStateTitle, className)} {...rest} />;
});

export const EmptyStateDescription = identify("EmptyState.Description", function EmptyStateDescription({ className = "", ...rest }: EmptyStatePartProps) {
  return <div className={astralisMerge(emptyStateDescription, className)} {...rest} />;
});

/** Call-to-action row under the copy — typically a Button or two. */
export const EmptyStateActions = identify("EmptyState.Actions", function EmptyStateActions({ className = "", ...rest }: EmptyStatePartProps) {
  return <div className={astralisMerge(emptyStateActions, className)} {...rest} />;
});
