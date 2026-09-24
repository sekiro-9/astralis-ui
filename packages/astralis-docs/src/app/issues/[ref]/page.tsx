import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, DataList, Heading, Separator, Tag, Text } from "astralis-ui";

import { formatDate, plural } from "@/lib/issues/format";
import { GITHUB_REPO } from "@/lib/issues/model";
import { AccountBar, SignInButton } from "@/modules/issues/account-bar";
import { SeverityBadge, StatusBadge } from "@/modules/issues/badges";
import { CommentForm } from "@/modules/issues/comment-form";
import { IssueTimeline } from "@/modules/issues/issue-timeline";
import { NotConfigured } from "@/modules/issues/not-configured";
import { SnapshotView } from "@/modules/issues/snapshot-view";
import { canSignIn, currentUser } from "@/server/auth";
import { isConfigured } from "@/server/db/client";
import { getIssue, issueHref, MAX_COMMENT_LENGTH, type Person } from "@/server/issues";
import { checkRepro } from "@/server/repro";

type Props = { params: Promise<{ ref: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isConfigured()) return { title: "Issue" };
  const issue = await getIssue((await params).ref);
  return { title: issue ? issue.title : "Issue not found" };
}

const who = (p: Person | null): string => (p ? (p.login ?? p.name) : "a deleted user");

function Byline({ person, date }: { person: Person | null; date: Date }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar size="xs" src={person?.image ?? undefined} name={person ? who(person) : "?"} />
      <Text as="span" size="sm" weight="medium">
        {who(person)}
      </Text>
      <Text as="span" size="xs" color="muted">
        {formatDate(date)}
      </Text>
    </div>
  );
}

function Words({ label, text }: { label: string; text?: string }) {
  if (!text) return null;
  return (
    <div className="flex flex-col gap-1">
      <Text size="sm" weight="semibold">
        {label}
      </Text>
      <Text size="sm" lineHeight="relaxed" className="whitespace-pre-wrap">
        {text}
      </Text>
    </div>
  );
}

export default async function IssuePage({ params }: Props) {
  if (!isConfigured()) return <NotConfigured />;
  const { ref } = await params;
  const [issue, user] = await Promise.all([getIssue(ref), currentUser()]);
  if (!issue) notFound();
  const href = issueHref(issue);
  const [first, ...more] = issue.reports;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/issues" className="text-sm text-label-muted hover:text-label">
            ← Issues &amp; Contributions
          </Link>
          <AccountBar user={user} canSignIn={canSignIn()} returnTo={href} />
        </div>
        <Heading as="h1" size="2xl" weight="semibold" letterSpacing="tight">
          {issue.title}
          {issue.githubNumber && <span className="ml-2 font-normal text-label-muted">#{issue.githubNumber}</span>}
        </Heading>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={issue.status} />
          {issue.severity && <SeverityBadge severity={issue.severity} />}
          <Text as="span" size="sm" color="muted">
            {plural(issue.reportCount, "report")} · opened {formatDate(issue.createdAt)} by {who(first?.reporter ?? null)}
          </Text>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-10">
          {first && (
            <section className="flex flex-col gap-4">
              <Words label="What happened" text={first.snapshot.description.happened} />
              <Words label="What was expected" text={first.snapshot.description.expected} />
              <SnapshotView snapshot={first.snapshot} repro={checkRepro(first.snapshot)} />
            </section>
          )}

          {more.length > 0 && (
            <section className="flex flex-col gap-3">
              <Heading as="h2" size="lg" weight="semibold">
                More reports ({more.length})
              </Heading>
              {more.map((report) => (
                <details key={report.id} className="group rounded-xl border border-stroke-base">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-surface-subtle">
                    <Byline person={report.reporter} date={report.createdAt} />
                    <Text as="span" size="sm" color="muted">
                      {report.snapshot.description.title}
                      {report.snapshot.route && ` · ${report.snapshot.route}`}
                    </Text>
                  </summary>
                  <div className="flex flex-col gap-4 border-t border-stroke-base p-4">
                    <Words label="What happened" text={report.snapshot.description.happened} />
                    <Words label="What was expected" text={report.snapshot.description.expected} />
                    <SnapshotView snapshot={report.snapshot} repro={checkRepro(report.snapshot)} />
                  </div>
                </details>
              ))}
            </section>
          )}

          <section className="flex flex-col gap-5" aria-labelledby="discussion">
            <Heading as="h2" id="discussion" size="lg" weight="semibold">
              Discussion
            </Heading>
            {issue.comments.length === 0 && (
              <Text size="sm" color="muted">
                No comments yet.
              </Text>
            )}
            <ol className="flex flex-col gap-4">
              {issue.comments.map((comment) => (
                <li key={comment.id} className="flex flex-col gap-2 rounded-xl border border-stroke-base p-4">
                  <Byline person={comment.author} date={comment.createdAt} />
                  <Text size="sm" lineHeight="relaxed" className="whitespace-pre-wrap break-words">
                    {comment.body}
                  </Text>
                </li>
              ))}
            </ol>
            {user ? (
              <CommentForm issueId={issue.id} returnTo={href} maxLength={MAX_COMMENT_LENGTH} />
            ) : canSignIn() ? (
              <SignInButton returnTo={href} label="Sign in with GitHub to comment" />
            ) : null}
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <DataList>
            <DataList.Item>
              <DataList.Label>Component</DataList.Label>
              <DataList.Value>
                <Link href={`/issues?status=all&component=${encodeURIComponent(issue.component)}`}>
                  <Tag size="sm" variant="subtle">
                    {issue.component}
                  </Tag>
                </Link>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>Rules</DataList.Label>
              <DataList.Value>
                {issue.ruleCodes.length ? (
                  <span className="flex min-w-0 flex-col gap-1">
                    {issue.ruleCodes.map((code) => (
                      <Link
                        key={code}
                        href={`/issues?status=all&rule=${encodeURIComponent(code)}`}
                        className="break-all font-mono text-xs hover:underline"
                      >
                        {code}
                      </Link>
                    ))}
                  </span>
                ) : (
                  "None"
                )}
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>Assigned</DataList.Label>
              <DataList.Value>
                {issue.assignment === "contributors"
                  ? `Open to contributors${issue.assignee ? `, claimed by ${issue.assignee}` : ""}`
                  : issue.assignee ?? "Not yet"}
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>GitHub</DataList.Label>
              <DataList.Value>
                {issue.githubNumber ? (
                  <a
                    href={`https://github.com/${GITHUB_REPO}/issues/${issue.githubNumber}`}
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {GITHUB_REPO}#{issue.githubNumber}
                  </a>
                ) : (
                  "Not linked yet"
                )}
              </DataList.Value>
            </DataList.Item>
          </DataList>
          <Separator />
          <div className="flex flex-col gap-3">
            <Heading as="h2" size="sm" weight="semibold">
              History
            </Heading>
            <IssueTimeline events={issue.events} />
          </div>
        </aside>
      </div>
    </div>
  );
}
