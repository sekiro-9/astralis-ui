import { CircleDot, FilePlus, RefreshCw } from "lucide-react";
import { Icon, Timeline } from "astralis-ui";

import { formatDate } from "@/lib/issues/format";
import { STATUS_LABELS } from "@/lib/issues/model";
import type { IssueDetail, Person } from "@/server/issues";

const who = (p: Person | null): string => (p ? (p.login ?? p.name) : "a deleted user");

function describe(event: IssueDetail["events"][number]): string {
  switch (event.kind) {
    case "opened":
      return `Opened by ${who(event.actor)}`;
    case "report_added":
      return `Reported again by ${who(event.actor)}`;
    case "status_changed":
      return `${event.status ? STATUS_LABELS[event.status] : "Status changed"}${event.actor ? ` by ${who(event.actor)}` : ""}`;
    default:
      return event.kind;
  }
}

const ICONS = { opened: CircleDot, report_added: FilePlus, status_changed: RefreshCw } as const;

/** The issue's history: opened, reported again, and each status it moved through. */
export function IssueTimeline({ events }: { events: IssueDetail["events"] }) {
  return (
    <Timeline size="sm" variant="subtle">
      {events.map((event) => (
        <Timeline.Item key={event.id}>
          <Timeline.Indicator>
            <Icon as={ICONS[event.kind as keyof typeof ICONS] ?? CircleDot} size="xs" />
          </Timeline.Indicator>
          <Timeline.Content>
            <Timeline.Title>{describe(event)}</Timeline.Title>
            <Timeline.Description>{formatDate(event.createdAt)}</Timeline.Description>
          </Timeline.Content>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
