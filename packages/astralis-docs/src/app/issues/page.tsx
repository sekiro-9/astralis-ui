import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, GitPullRequest, Inbox, MessageSquareWarning } from "lucide-react";
import { Button, Card, EmptyState, Heading, Icon, Text } from "astralis-ui";

import { CONTRIBUTOR_LABELS, filtersHref, parseFilters, REPO_URL, type StatusFilter } from "@/lib/issues/github";
import { listIssues, listLabels } from "@/lib/issues/fetch";
import { FilterBar } from "@/modules/issues/filter-bar";
import { IssueList } from "@/modules/issues/issue-list";

export const metadata: Metadata = {
  title: "Issues & Contributions",
  description:
    "Problems reported from applications built with Astralis, with the evidence attached, and the fixes contributors can take on. Read from GitHub.",
};

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "contributors", label: "Open to contributors" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

function Intro() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card variant="outline">
        <Card.Header>
          <Icon as={MessageSquareWarning} size="md" color="accent" />
          <Card.Title>Report a problem</Card.Title>
        </Card.Header>
        <Card.Body>
          <Text size="sm" color="muted" lineHeight="relaxed">
            In your app, open the Astralis DevTools, pick the component and use Report, or run{" "}
            <code className="font-mono text-xs">npx astralis report</code> on the files involved. The report
            becomes a GitHub issue, opened from your own account, with the library version, the component tree,
            the validator&apos;s findings and a reproduction. Nothing is sent until you have read it, and if the
            problem is already reported you can add to that issue instead.
          </Text>
        </Card.Body>
        <Card.Footer>
          <Button as={Link} href="/docs/devtools#report" size="sm" variant="outline" colorScheme="gray">
            How reporting works
          </Button>
        </Card.Footer>
      </Card>
      <Card variant="outline">
        <Card.Header>
          <Icon as={GitPullRequest} size="md" color="accent" />
          <Card.Title>Contribute a fix</Card.Title>
        </Card.Header>
        <Card.Body>
          <Text size="sm" color="muted" lineHeight="relaxed">
            Issues the maintainers label {CONTRIBUTOR_LABELS.map((l) => `“${l}”`).join(" or ")} are open to anyone,
            each with a reproduction to start from. A fix arrives as a pull request to astralis-ui, and it is
            merged only after the library build, the tests and the validator all pass.
          </Text>
        </Card.Body>
        <Card.Footer className="flex flex-wrap gap-2">
          <Button as={Link} href="/issues?status=contributors" size="sm" variant="outline" colorScheme="gray">
            Open to contributors
          </Button>
          <Button as="a" href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" size="sm" variant="text" colorScheme="gray">
            Contributing guide
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}

function StatusTabs({ current, href }: { current: StatusFilter; href: (status: StatusFilter) => string }) {
  return (
    <nav aria-label="Issue status" className="docs-scroll flex gap-1 self-start overflow-x-auto rounded-xl bg-surface-subtle p-1 max-lg:max-w-full">
      {STATUS_TABS.map((tab) => (
        <Link
          key={tab.value}
          href={href(tab.value)}
          aria-current={current === tab.value ? "page" : undefined}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
            current === tab.value ? "bg-surface font-medium text-label shadow-sm" : "text-label-muted hover:text-label"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function IssuesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFilters(await searchParams);
  const [{ issues, more }, labels] = await Promise.all([listIssues(filters), listLabels()]);
  const filtered = Boolean(filters.label || filters.q);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <Heading as="h1" size="3xl" weight="semibold" letterSpacing="tight">
            Issues &amp; Contributions
          </Heading>
          <Text color="muted" lineHeight="relaxed" mt="3">
            Problems met in applications built with Astralis, each reported with the evidence to reproduce it,
            and the fixes anyone can take on. The issues live on GitHub; this page reads them.
          </Text>
        </div>
        <Button as="a" href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer" size="sm" variant="outline" colorScheme="gray" className="shrink-0">
          View on GitHub
          <Icon as={ExternalLink} size="xs" />
        </Button>
      </header>

      <Intro />

      <section className="flex flex-col gap-4" aria-labelledby="issues-heading">
        <Heading as="h2" id="issues-heading" size="lg" weight="semibold">
          Issues
        </Heading>
        <div className="flex flex-col gap-3">
          <StatusTabs current={filters.status} href={(status) => filtersHref({ ...filters, status, page: 1 })} />
          <FilterBar filters={filters} labels={labels} />
        </div>

        {issues.length > 0 ? (
          <IssueList issues={issues} />
        ) : (
          <EmptyState className="rounded-xl border border-dashed border-stroke-base py-12">
            <EmptyState.Indicator>
              <Inbox />
            </EmptyState.Indicator>
            <EmptyState.Title>{filtered ? "No issues match" : "Nothing here yet"}</EmptyState.Title>
            <EmptyState.Description>
              {filtered
                ? "Try other words or another label, or clear the filters."
                : filters.status === "contributors"
                  ? "No issue is open to contributors right now."
                  : "Issues appear here once someone reports a problem from the DevTools, the CLI or GitHub."}
            </EmptyState.Description>
            {filtered && (
              <EmptyState.Actions>
                <Button as={Link} href={filtersHref({ status: filters.status })} size="sm" variant="outline" colorScheme="gray">
                  Clear filters
                </Button>
              </EmptyState.Actions>
            )}
          </EmptyState>
        )}

        {(filters.page > 1 || more) && (
          <div className="flex justify-between">
            {filters.page > 1 ? (
              <Button as={Link} href={filtersHref({ ...filters, page: filters.page - 1 })} size="sm" variant="text" colorScheme="gray">
                Newer
              </Button>
            ) : (
              <span />
            )}
            {more && (
              <Button as={Link} href={filtersHref({ ...filters, page: filters.page + 1 })} size="sm" variant="text" colorScheme="gray">
                Older
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
