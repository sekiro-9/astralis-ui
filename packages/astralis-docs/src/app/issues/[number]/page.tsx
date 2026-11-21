import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MessageSquarePlus } from "lucide-react";
import { Avatar, Box, Button, DataList, Flex, Grid, Heading, Icon, Link, Separator, Stack, Text } from "astralis-ui";

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
    <Flex alignItems="center" gap="2">
      <Avatar size="xs" src={person?.avatar} name={person?.login ?? "ghost"} />
      {person ? (
        <Link href={person.url} target="_blank" rel="noreferrer" size="sm" weight="medium" color="base">
          {person.login}
        </Link>
      ) : (
        <Text as="span" size="sm" weight="medium">
          a deleted user
        </Text>
      )}
      <Text as="span" size="xs" color="muted">
        {formatDate(date)}
      </Text>
    </Flex>
  );
}

/**
 * GitHub's own rendering of an issue or comment. GitHub sanitises this HTML
 * for its own pages; it is shown as given, never built from the raw text here.
 */
function GitHubHtml({ html }: { html: string }) {
  return <Box className="gh-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}

function Words({ label, text }: { label: string; text?: string }) {
  if (!text) return null;
  return (
    <Stack gap="1">
      <Text size="sm" weight="semibold">
        {label}
      </Text>
      <Text size="sm" lineHeight="relaxed" className="whitespace-pre-wrap">
        {text}
      </Text>
    </Stack>
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
    <Stack as="ol" gap="4">
      {comments.map((comment) => (
        <Stack as="li" key={comment.id} gap="3" p="4" rounded="xl" border="normal" borderColor="base">
          <Byline person={comment.author} date={comment.createdAt} />
          <GitHubHtml html={comment.html} />
        </Stack>
      ))}
    </Stack>
  );
}

export default async function IssuePage({ params }: Props) {
  const number = numberOf((await params).number);
  const issue = number ? await getIssue(number) : null;
  if (!issue) notFound();
  const snapshot = snapshotOf(issue.body);

  return (
    <Stack gap="10">
      <Stack as="header" gap="4">
        <Link as={NextLink} href="/issues" alignSelf="start" size="sm" color="muted" hover={{ color: "base" }} variant="plain">
          ← Issues &amp; Contributions
        </Link>
        <Heading as="h1" size="2xl" weight="semibold" letterSpacing="tight">
          {issue.title}
          <Text as="span" size="2xl" weight="normal" color="muted" lineHeight="none" ml="2">
            #{issue.number}
          </Text>
        </Heading>
        <Flex wrap="wrap" alignItems="center" gap="2">
          <StateBadge state={issue.state} />
          <Text as="span" size="sm" color="muted">
            opened {formatDate(issue.createdAt)} by {issue.author?.login ?? "a deleted user"} · {plural(issue.comments, "comment")}
          </Text>
        </Flex>
      </Stack>

      {/* The track sizes are a class: Grid's columns prop counts equal columns, and this is one fluid and one fixed. */}
      <Grid gap="10" className="lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Stack gap="10" minW="0">
          <Stack as="section" gap="4">
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
          </Stack>

          <Stack as="section" gap="5" aria-labelledby="discussion">
            <Heading as="h2" id="discussion" size="lg" weight="semibold">
              Discussion
            </Heading>
            <Thread comments={issue.thread} />
            <Button
              as="a"
              href={issue.url}
              target="_blank"
              rel="noreferrer"
              size="sm"
              variant="outline"
              colorScheme="gray"
              alignSelf="start"
              leftIcon={<Icon as={MessageSquarePlus} size="xs" />}
            >
              Comment on GitHub
            </Button>
          </Stack>
        </Stack>

        <Stack as="aside" gap="6" position={{ lg: "sticky" }} top={{ lg: "24" }} alignSelf={{ lg: "start" }}>
          <DataList>
            {issue.component && (
              <DataList.Item>
                <DataList.Label>Component</DataList.Label>
                <DataList.Value>
                  <Link as={NextLink} href={`/issues?status=all&q=${encodeURIComponent(issue.component)}`} fontFamily="mono" size="sm" color="inherit">
                    {issue.component}
                  </Link>
                </DataList.Value>
              </DataList.Item>
            )}
            {snapshot?.findings && snapshot.findings.length > 0 && (
              <DataList.Item>
                <DataList.Label>Rules</DataList.Label>
                <DataList.Value>
                  <Stack as="span" gap="1" minW="0">
                    {[...new Set(snapshot.findings.map((f) => f.code))].map((code) => (
                      <Text as="span" key={code} fontFamily="mono" size="xs" color="inherit" className="break-all">
                        {code}
                      </Text>
                    ))}
                  </Stack>
                </DataList.Value>
              </DataList.Item>
            )}
            <DataList.Item>
              <DataList.Label>Labels</DataList.Label>
              <DataList.Value>
                {issue.labels.length ? (
                  <Flex as="span" wrap="wrap" gap="1.5">
                    {issue.labels.map((label) => (
                      <NextLink key={label.name} href={`/issues?status=all&label=${encodeURIComponent(label.name)}`}>
                        <LabelTag label={label} />
                      </NextLink>
                    ))}
                  </Flex>
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
          <Button
            as="a"
            href={issue.url}
            target="_blank"
            rel="noreferrer"
            size="sm"
            variant="outline"
            colorScheme="gray"
            rightIcon={<Icon as={ExternalLink} size="xs" />}
          >
            View on GitHub
          </Button>
          <Text size="xs" color="muted" lineHeight="relaxed">
            Read from <Link href={REPO_URL} target="_blank" rel="noreferrer" variant="underline" color="inherit">GitHub</Link>, refreshed every minute. Comments,
            labels and closing happen there.
          </Text>
        </Stack>
      </Grid>
    </Stack>
  );
}
