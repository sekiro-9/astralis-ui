import { EmptyStateRoot } from "./components/empty-state-root";
import {
  EmptyStateIndicator,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "./components/empty-state-parts";

export const EmptyState = Object.assign(EmptyStateRoot, {
  Indicator: EmptyStateIndicator,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
});

export { EmptyStateRoot, EmptyStateIndicator, EmptyStateTitle, EmptyStateDescription, EmptyStateActions };

export type { EmptyStateProps, EmptyStatePartProps, EmptyStateSize } from "./empty-state.types";
