import Link from "next/link";
import { MessageSquare, Pin } from "lucide-react";
import { Icon, Text } from "astralis-ui";

import { formatDate, plural } from "@/lib/issues/format";
import { OPEN_STATUSES } from "@/lib/issues/model";
import { issueHref, type IssueSummary } from "@/server/issues";

import { SeverityBadge, StatusBadge } from "./badges";

/** One line of facts under an issue's title. */
function Meta({ issue }: { issue: IssueSummary }) {
  const parts = [
    issue.githubNumber ? `#${issue.githubNumber}` : null,
    issue.component,
    ...issue.ruleCodes,
    `opened ${formatDate(issue.createdAt)}`,
  ].filter(Boolean);
  return (
    <Text as="span" size="xs" color="muted" className="font-mono">
      {parts.join(" · ")}
    </Text>
  );
}

export function IssueList({ issues }: { issues: IssueSummary[] }) {
  return (
    <ul className="divide-y divide-stroke-base overflow-hidden rounded-xl border border-stroke-base">
      {issues.map((issue) => {
        const pinned = issue.severity === "critical" && OPEN_STATUSES.includes(issue.status);
        return (
          <li key={issue.id} className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-surface-subtle sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                {pinned && <Icon as={Pin} size="xs" color="error" aria-label="Pinned: critical" />}
                <Link href={issueHref(issue)} className="truncate font-medium text-label hover:underline">
                  {issue.title}
                </Link>
              </div>
              <Meta issue={issue} />
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {issue.severity && <SeverityBadge severity={issue.severity} />}
              <StatusBadge status={issue.status} />
              <Text as="span" size="xs" color="muted" className="flex w-32 items-center justify-end gap-2 tabular-nums max-sm:justify-start">
                {plural(issue.reportCount, "report")}
                {issue.commentCount > 0 && (
                  <span className="inline-flex items-center gap-1" aria-label={plural(issue.commentCount, "comment")}>
                    <Icon as={MessageSquare} size="xs" />
                    {issue.commentCount}
                  </span>
                )}
              </Text>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
