import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Avatar, Icon, Text } from "astralis-ui";

import { formatDate } from "@/lib/issues/format";
import type { IssueSummary } from "@/lib/issues/github";

import { LabelTag, StateBadge } from "./badges";

export function IssueList({ issues }: { issues: IssueSummary[] }) {
  return (
    <ul className="divide-y divide-stroke-base overflow-hidden rounded-xl border border-stroke-base">
      {issues.map((issue) => (
        <li key={issue.number} className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-surface-subtle sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Link href={`/issues/${issue.number}`} className="font-medium text-label hover:underline">
              {issue.title}
            </Link>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Text as="span" size="xs" color="muted" className="font-mono">
                #{issue.number}
                {issue.component && ` · ${issue.component}`} · updated {formatDate(issue.updatedAt)}
              </Text>
              {issue.labels.map((label) => (
                <LabelTag key={label.name} label={label} />
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <StateBadge state={issue.state} />
            <Text as="span" size="xs" color="muted" className="flex w-10 items-center justify-end gap-1 tabular-nums max-sm:justify-start">
              {issue.comments > 0 && (
                <>
                  <Icon as={MessageSquare} size="xs" aria-hidden />
                  <span aria-label={`${issue.comments} comments`}>{issue.comments}</span>
                </>
              )}
            </Text>
            {issue.author && <Avatar size="xs" src={issue.author.avatar} name={issue.author.login} title={issue.author.login} />}
          </div>
        </li>
      ))}
    </ul>
  );
}
