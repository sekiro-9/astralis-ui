import { Alert, Button, EmptyState, Progress, Skeleton, Spinner } from "astralis-ui";
import { alertProps } from "../alert/alert-props";
import { emptyStateProps } from "../empty-state/empty-state-props";
import { progressProps } from "../progress/progress-props";
import { skeletonProps } from "../skeleton/skeleton-props";
import { spinnerProps } from "../spinner/spinner-props";
import { asEntry, definePlaygrounds } from "./define";

export const feedbackPlaygrounds = definePlaygrounds({
  "alert-demo": {
    tag: "Alert",
    component: asEntry(Alert),
    rows: alertProps,
    fixture: (
      <>
        <Alert.Title>Scheduled maintenance</Alert.Title>
        <Alert.Description>
          The dashboard will be read-only on Saturday from 02:00–04:00 UTC.
        </Alert.Description>
      </>
    ),
  },
  "progress-demo": { tag: "Progress", component: asEntry(Progress), rows: progressProps },
  "spinner-demo": { tag: "Spinner", component: asEntry(Spinner), rows: spinnerProps },
  "skeleton-demo": { tag: "Skeleton", component: asEntry(Skeleton), rows: skeletonProps },
  "empty-state-demo": {
    tag: "EmptyState",
    component: asEntry(EmptyState),
    rows: emptyStateProps,
    fixture: (
      <>
        <EmptyState.Indicator>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        </EmptyState.Indicator>
        <EmptyState.Title>No messages yet</EmptyState.Title>
        <EmptyState.Description>When someone writes to you, the conversation shows up here.</EmptyState.Description>
        <EmptyState.Actions>
          <Button size="sm">New message</Button>
        </EmptyState.Actions>
      </>
    ),
  },
});
