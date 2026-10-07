import { Badge } from "astralis-ui";

import type { IssueState, Label } from "@/lib/issues/github";

const STATES: Record<IssueState, { label: string; scheme: "green" | "purple" | "gray" }> = {
  open: { label: "Open", scheme: "green" },
  done: { label: "Closed", scheme: "purple" },
  "not-planned": { label: "Not planned", scheme: "gray" },
};

export function StateBadge({ state }: { state: IssueState }) {
  const { label, scheme } = STATES[state];
  return (
    <Badge variant="subtle" colorScheme={scheme}>
      {label}
    </Badge>
  );
}

/**
 * A GitHub label, in its own colour. The colour is a dot rather than the
 * fill, so a pale or dark label reads the same in light and dark mode; it is
 * an inline style because it is data, not a class the CSS build can know.
 */
export function LabelTag({ label }: { label: Label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stroke-base px-2 py-0.5 text-xs text-label-muted">
      <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: `#${label.color}` }} />
      {label.name}
    </span>
  );
}
