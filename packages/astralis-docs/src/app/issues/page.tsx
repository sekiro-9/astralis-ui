import type { Metadata } from "next";
import NextLink from "next/link";
import { ExternalLink, GitPullRequest, Inbox, MessageSquareWarning } from "lucide-react";
import { Box, Button, Card, EmptyState, Flex, Grid, Heading, Icon, Stack, Text } from "astralis-ui";

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
    <Grid columns={{ base: "1", md: "2" }} gap="4">
      <Card variant="outline">
        <Card.Header>
          <Icon as={MessageSquareWarning} size="md" color="accent" />
          <Card.Title>Report a problem</Card.Title>
        </Card.Header>
        <Card.Body>
          <Text size="sm" color="muted" lineHeight="relaxed">
            In your app, open the Astralis DevTools, pick the component and use Report, or run{" "}
            <Text as="code" fontFamily="mono" size="xs">npx astralis report</Text> on the files involved. The report
            becomes a GitHub issue, opened from your own account, with the library version, the component tree,
            the validator&apos;s findings and a reproduction. Nothing is sent until you have read it, and if the
            problem is already reported you can add to that issue instead.
          </Text>
        </Card.Body>
        <Card.Footer>
          <Button as={NextLink} href="/docs/devtools#report" size="sm" variant="outline" colorScheme="gray">
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
        <Card.Footer>
          <Flex wrap="wrap" gap="2">
            <Button as={NextLink} href="/issues?status=contributors" size="sm" variant="outline" colorScheme="gray">
              Open to contributors
            </Button>
            <Button as="a" href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" size="sm" variant="text" colorScheme="gray">
              Contributing guide
            </Button>
          </Flex>
        </Card.Footer>
      </Card>
    </Grid>
  );
}

function StatusTabs({ current, href }: { current: StatusFilter; href: (status: StatusFilter) => string }) {
  return (
    <Flex
      as="nav"
      aria-label="Issue status"
      gap="1"
      p="1"
      rounded="xl"
      bg="subtle"
      alignSelf="start"
      overflowX="auto"
      maxW={{ base: "full", lg: "none" }}
      className="docs-scroll"
    >
      {STATUS_TABS.map((tab) => {
        const active = current === tab.value;
        return (
          // A Flex, so the label is a flex item and the tab is as tall as its text, not as a line of body copy.
          <Flex
            as={NextLink}
            key={tab.value}
            href={href(tab.value)}
            aria-current={active ? "page" : undefined}
            px="3"
            py="1.5"
            rounded="lg"
            bg={active ? "base" : undefined}
            shadow={active ? "sm" : undefined}
            color={active ? "base" : "muted"}
            hover={{ color: "base" }}
            className="whitespace-nowrap transition-colors"
          >
            <Text as="span" size="sm" weight={active ? "medium" : "normal"} color="inherit">
              {tab.label}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
}

export default async function IssuesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFilters(await searchParams);
  const [{ issues, more }, labels] = await Promise.all([listIssues(filters), listLabels()]);
  const filtered = Boolean(filters.label || filters.q);

  return (
    <Stack gap="10">
      <Flex as="header" direction={{ base: "column", sm: "row" }} alignItems={{ sm: "start" }} justifyContent={{ sm: "between" }} gap="4">
        <Box maxW="3xl">
          <Heading as="h1" size="3xl" weight="semibold" letterSpacing="tight">
            Issues &amp; Contributions
          </Heading>
          <Text color="muted" lineHeight="relaxed" mt="3">
            Problems met in applications built with Astralis, each reported with the evidence to reproduce it,
            and the fixes anyone can take on. The issues live on GitHub; this page reads them.
          </Text>
        </Box>
        <Button
          as="a"
          href={`${REPO_URL}/issues`}
          target="_blank"
          rel="noreferrer"
          size="sm"
          variant="outline"
          colorScheme="gray"
          shrink="0"
          rightIcon={<Icon as={ExternalLink} size="xs" />}
        >
          View on GitHub
        </Button>
      </Flex>

      <Intro />

      <Stack as="section" gap="4" aria-labelledby="issues-heading">
        <Heading as="h2" id="issues-heading" size="lg" weight="semibold">
          Issues
        </Heading>
        <Stack gap="3">
          <StatusTabs current={filters.status} href={(status) => filtersHref({ ...filters, status, page: 1 })} />
          <FilterBar filters={filters} labels={labels} />
        </Stack>

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
                <Button as={NextLink} href={filtersHref({ status: filters.status })} size="sm" variant="outline" colorScheme="gray">
                  Clear filters
                </Button>
              </EmptyState.Actions>
            )}
          </EmptyState>
        )}

        {(filters.page > 1 || more) && (
          <Flex>
            {filters.page > 1 && (
              <Button as={NextLink} href={filtersHref({ ...filters, page: filters.page - 1 })} size="sm" variant="text" colorScheme="gray">
                Newer
              </Button>
            )}
            {more && (
              <Button as={NextLink} href={filtersHref({ ...filters, page: filters.page + 1 })} size="sm" variant="text" colorScheme="gray" ml="auto">
                Older
              </Button>
            )}
          </Flex>
        )}
      </Stack>
    </Stack>
  );
}
