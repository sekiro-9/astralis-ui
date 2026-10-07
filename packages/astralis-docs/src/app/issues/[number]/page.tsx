import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MessageSquarePlus } from "lucide-react";
import { Avatar, Button, DataList, Heading, Icon, Separator, Text } from "astralis-ui";

import { getIssue, type IssueDetail, type Comment } from "@/lib/issues/fetch";
import { formatDate, plural } from "@/lib/issues/format";
import { REPO_URL, snapshotOf } from "@/lib/issues/github";
import { checkRepro } from "@/lib/issues/repro";
import { LabelTag, StateBadge } from "@/modules/issues/badges";
import { SnapshotView } from "@/modules/issues/snapshot-view";

type Props = { params: Promise<{ number: string }> };

/** The issue number in the URL, or null when it is not one. */
const numberOf = (value: string) => (/^[1-9]\d{0,6}$/.test(value) ? Number(value) : null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const number = numberOf((await params).number);
  const issue = number ? await getIssue(number) : null;
  return { title: issue ? `${issue.title} · #${issue.number}` : "Issue not found" };
}

function Byline({ person, date }: { person: IssueDetail["author"]; date: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar size="xs" src={person?.avatar} name={person?.login ?? "ghost"} />
      {person ? (
        <a href={person.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-label hover:underline">
          {person.login}
        </a>
      ) : (
        <Text as="span" size="sm" weight="medium">
          a deleted user
        </Text>
      )}
      <Text as="span" size="xs" color="muted">
        {formatDate(date)}
      </Text>
    </div>
  );
}

/**
 * GitHub's own rendering of an issue or comment. GitHub sanitises this HTML
 * for its own pages; it is shown as given, never built from the raw text here.
 */
function GitHubHtml({ html }: { html: string }) {
  return <div className="gh-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
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

function Thread({ comments }: { comments: Comment[] }) {
  if (!comments.length) {
    return (
      <Text size="sm" color="muted">
        No comments yet.
      </Text>
    );
  }
  return (
    <ol className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="flex flex-col gap-3 rounded-xl border border-stroke-base p-4">
          <Byline person={comment.author} date={comment.createdAt} />
          <GitHubHtml html={comment.html} />
        </li>
      ))}
    </ol>
  );
}

export default async function IssuePage({ params }: Props) {
  const number = numberOf((await params).number);
  const issue = number ? await getIssue(number) : null;
  if (!issue) notFound();
  const snapshot = snapshotOf(issue.body);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Link href="/issues" className="text-sm text-label-muted hover:text-label">
          ← Issues &amp; Contributions
        </Link>
        <Heading as="h1" size="2xl" weight="semibold" letterSpacing="tight">
          {issue.title}
          <span className="ml-2 font-normal text-label-muted">#{issue.number}</span>
        </Heading>
        <div className="flex flex-wrap items-center gap-2">
          <StateBadge state={issue.state} />
          <Text as="span" size="sm" color="muted">
            opened {formatDate(issue.createdAt)} by {issue.author?.login ?? "a deleted user"} · {plural(issue.comments, "comment")}
          </Text>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <section className="flex flex-col gap-4">
            <Byline person={issue.author} date={issue.createdAt} />
            {snapshot ? (
              <>
                <Words label="What happened" text={snapshot.description.happened} />
                <Words label="What was expected" text={snapshot.description.expected} />
                <SnapshotView snapshot={snapshot} repro={checkRepro(snapshot)} />
              </>
            ) : issue.html ? (
              <GitHubHtml html={issue.html} />
            ) : (
              <Text size="sm" color="muted">
                No description.
              </Text>
            )}
          </section>

          <section className="flex flex-col gap-5" aria-labelledby="discussion">
            <Heading as="h2" id="discussion" size="lg" weight="semibold">
              Discussion
            </Heading>
            <Thread comments={issue.thread} />
            <div>
              <Button as="a" href={issue.url} target="_blank" rel="noreferrer" size="sm" variant="outline" colorScheme="gray">
                <Icon as={MessageSquarePlus} size="xs" />
                Comment on GitHub
              </Button>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <DataList>
            {issue.component && (
              <DataList.Item>
                <DataList.Label>Component</DataList.Label>
                <DataList.Value>
                  <Link href={`/issues?status=all&q=${encodeURIComponent(issue.component)}`} className="font-mono text-sm hover:underline">
                    {issue.component}
                  </Link>
                </DataList.Value>
              </DataList.Item>
            )}
            {snapshot?.findings && snapshot.findings.length > 0 && (
              <DataList.Item>
                <DataList.Label>Rules</DataList.Label>
                <DataList.Value>
                  <span className="flex min-w-0 flex-col gap-1">
                    {[...new Set(snapshot.findings.map((f) => f.code))].map((code) => (
                      <span key={code} className="break-all font-mono text-xs">
                        {code}
                      </span>
                    ))}
                  </span>
                </DataList.Value>
              </DataList.Item>
            )}
            <DataList.Item>
              <DataList.Label>Labels</DataList.Label>
              <DataList.Value>
                {issue.labels.length ? (
                  <span className="flex flex-wrap gap-1.5">
                    {issue.labels.map((label) => (
                      <Link key={label.name} href={`/issues?status=all&label=${encodeURIComponent(label.name)}`}>
                        <LabelTag label={label} />
                      </Link>
                    ))}
                  </span>
                ) : (
                  "None yet"
                )}
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>Updated</DataList.Label>
              <DataList.Value>{formatDate(issue.updatedAt)}</DataList.Value>
            </DataList.Item>
          </DataList>
          <Separator />
          <Button as="a" href={issue.url} target="_blank" rel="noreferrer" size="sm" variant="outline" colorScheme="gray">
            View on GitHub
            <Icon as={ExternalLink} size="xs" />
          </Button>
          <Text size="xs" color="muted" lineHeight="relaxed">
            Read from <a href={REPO_URL} className="underline" target="_blank" rel="noreferrer">GitHub</a>, refreshed every minute. Comments,
            labels and closing happen there.
          </Text>
        </aside>
      </div>
    </div>
  );
}
