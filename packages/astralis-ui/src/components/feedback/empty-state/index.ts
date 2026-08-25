import { EmptyStateRoot } from "./components/empty-state-root";
import {
  EmptyStateIndicator,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "./components/empty-state-parts";

// 1️⃣ Compound API
export const EmptyState = Object.assign(EmptyStateRoot, {
  Indicator: EmptyStateIndicator,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
});

// 2️⃣ Flat exports
export { EmptyStateRoot, EmptyStateIndicator, EmptyStateTitle, EmptyStateDescription, EmptyStateActions };

// 3️⃣ Type exports
export type { EmptyStateProps, EmptyStatePartProps, EmptyStateSize } from "./empty-state.types";
