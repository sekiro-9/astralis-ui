import type { Metadata } from "next";
import Link from "next/link";
import { GitPullRequest, Inbox, MessageSquareWarning } from "lucide-react";
import { Alert, Button, Card, EmptyState, Heading, Icon, Text } from "astralis-ui";

import { filtersHref, parseFilters, type StatusFilter } from "@/lib/issues/filters";
import { AccountBar } from "@/modules/issues/account-bar";
import { FilterBar } from "@/modules/issues/filter-bar";
import { IssueList } from "@/modules/issues/issue-list";
import { NotConfigured } from "@/modules/issues/not-configured";
import { canSignIn, currentUser } from "@/server/auth";
import { isConfigured } from "@/server/db/client";
import { filterOptions, listIssues } from "@/server/issues";

export const metadata: Metadata = {
  title: "Issues & Contributions",
  description:
    "Problems reported from applications built with Astralis, with the evidence attached, and the fixes contributors can take on.",
};

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "contributors", label: "Open to contributors" },
  { value: "fixed", label: "Fixed" },
  { value: "released", label: "Released" },
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
            In your app, open the Astralis DevTools, pick the component and use the Report tab, or run{" "}
            <code className="font-mono text-xs">npx astralis report</code> on the files involved. The report
            carries the library version, the component tree and the validator&apos;s findings, and nothing is
            sent until you have read it. You sign in with GitHub here to submit it.
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
            Issues the maintainers open to contributors are listed under Open to contributors, each with a
            reproduction file to start from. A fix arrives as a pull request to astralis-ui, and a maintainer
            merges it only after the library build, the tests and the validator all pass.
          </Text>
        </Card.Body>
        <Card.Footer>
          <Button as={Link} href="/issues?status=contributors" size="sm" variant="outline" colorScheme="gray">
            Open to contributors
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
  const params = await searchParams;
  const header = (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl">
        <Heading as="h1" size="3xl" weight="semibold" letterSpacing="tight">
          Issues &amp; Contributions
        </Heading>
        <Text color="muted" lineHeight="relaxed" mt="3">
          Problems met in applications built with Astralis, each reported with the evidence to reproduce it.
          The code, pull requests and checks live on GitHub; this is where reports arrive, are grouped and are
          routed to whoever fixes them.
        </Text>
      </div>
      {isConfigured() && <AccountBar user={await currentUser()} canSignIn={canSignIn()} returnTo="/issues" />}
    </header>
  );

  if (!isConfigured()) {
    return (
      <div className="flex flex-col gap-10">
        {header}
        <NotConfigured />
      </div>
    );
  }

  const filters = parseFilters(params);
  const page = Math.max(1, Math.min(1000, Number(params.page) || 1));
  const [{ issues, more }, options] = await Promise.all([listIssues(filters, page), filterOptions()]);
  const filtered = filters.component || filters.rule || filters.severity;

  return (
    <div className="flex flex-col gap-10">
      {header}
      {params.account === "deleted" && (
        <Alert status="success" variant="subtle">
          <Alert.Description>
            Your account is deleted. Your reports and comments stay with their issues, shown as from a deleted user.
          </Alert.Description>
        </Alert>
      )}
      <Intro />

      <section className="flex flex-col gap-4" aria-labelledby="issues-heading">
        <Heading as="h2" id="issues-heading" size="lg" weight="semibold">
          Issues
        </Heading>
        <div className="flex flex-col gap-3">
          <StatusTabs current={filters.status} href={(status) => filtersHref({ ...filters, status })} />
          <FilterBar filters={filters} components={options.components} rules={options.rules} />
        </div>

        {issues.length > 0 ? (
          <IssueList issues={issues} />
        ) : (
          <EmptyState className="rounded-xl border border-dashed border-stroke-base py-12">
            <EmptyState.Indicator>
              <Inbox />
            </EmptyState.Indicator>
            <EmptyState.Title>{filtered ? "No issues match these filters" : "Nothing here yet"}</EmptyState.Title>
            <EmptyState.Description>
              {filtered
                ? "Try another component, rule or severity, or clear the filters."
                : "Issues appear here once someone submits a report from the DevTools or the CLI."}
            </EmptyState.Description>
            {filtered && (
              <EmptyState.Actions>
                <Button as={Link} href={filtersHref({ ...filters, component: null, rule: null, severity: null })} size="sm" variant="outline" colorScheme="gray">
                  Clear filters
                </Button>
              </EmptyState.Actions>
            )}
          </EmptyState>
        )}

        {(page > 1 || more) && (
          <div className="flex justify-between">
            {page > 1 ? (
              <Button as={Link} href={filtersHref(filters, page - 1)} size="sm" variant="text" colorScheme="gray">
                Newer
              </Button>
            ) : (
              <span />
            )}
            {more && (
              <Button as={Link} href={filtersHref(filters, page + 1)} size="sm" variant="text" colorScheme="gray">
                Older
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
