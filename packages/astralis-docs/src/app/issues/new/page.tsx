import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Alert, Button, Card, EmptyState, Heading, Text } from "astralis-ui";

import { fingerprintOf } from "@/lib/issues/fingerprint";
import { plural } from "@/lib/issues/format";
import { STATUS_LABELS } from "@/lib/issues/model";
import { AccountBar, SignInButton } from "@/modules/issues/account-bar";
import { NotConfigured } from "@/modules/issues/not-configured";
import { ReportForm } from "@/modules/issues/report-form";
import { SnapshotView } from "@/modules/issues/snapshot-view";
import { canSignIn, currentUser } from "@/server/auth";
import { isConfigured } from "@/server/db/client";
import { DESCRIPTION_LIMITS, findDuplicates, issueHref, readDraft } from "@/server/issues";
import { checkRepro } from "@/server/repro";

export const metadata: Metadata = {
  title: "Submit a report",
  // A draft's address is its only key; keep it out of search engines.
  robots: { index: false, follow: false },
};

function Gone() {
  return (
    <EmptyState className="rounded-xl border border-dashed border-stroke-base py-16">
      <EmptyState.Indicator>
        <Clock />
      </EmptyState.Indicator>
      <EmptyState.Title>This draft is no longer here</EmptyState.Title>
      <EmptyState.Description>
        Drafts are kept for 24 hours and removed once submitted. Send the report again from the DevTools or
        with astralis report to make a new one.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button as={Link} href="/issues" size="sm" variant="outline" colorScheme="gray">
          All issues
        </Button>
      </EmptyState.Actions>
    </EmptyState>
  );
}

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ draft?: string | string[] }> }) {
  const { draft: param } = await searchParams;
  const draftId = typeof param === "string" ? param : "";
  const returnTo = `/issues/new?draft=${encodeURIComponent(draftId)}`;

  const heading = (user: Awaited<ReturnType<typeof currentUser>>) => (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl">
        <Heading as="h1" size="3xl" weight="semibold" letterSpacing="tight">
          Submit a report
        </Heading>
        <Text color="muted" lineHeight="relaxed" mt="3">
          Your snapshot arrived as a private draft: only someone with this page&apos;s address can see it. Review
          it below, then submit it as an issue.
        </Text>
      </div>
      <AccountBar user={user} canSignIn={canSignIn()} returnTo={returnTo} />
    </header>
  );

  if (!isConfigured()) return <NotConfigured />;
  const [user, draft] = await Promise.all([currentUser(), readDraft(draftId)]);
  if (!draft) {
    return (
      <div className="flex flex-col gap-10">
        {heading(user)}
        <Gone />
      </div>
    );
  }

  const snapshot = draft.snapshot;
  const duplicates = user ? await findDuplicates(fingerprintOf(snapshot).value) : [];

  return (
    <div className="flex flex-col gap-10">
      {heading(user)}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <Alert status="info" variant="subtle">
            <Alert.Title>A submitted report is public</Alert.Title>
            <Alert.Description>
              Everything shown on this page, with your GitHub username, becomes part of a public issue. Check that
              nothing in it is private before you submit.
            </Alert.Description>
          </Alert>
          {user ? (
            <ReportForm
              draftId={draft.id}
              description={snapshot.description}
              limits={DESCRIPTION_LIMITS}
              duplicates={duplicates.map((d) => ({
                id: d.id,
                href: issueHref(d),
                title: d.title,
                label: `${STATUS_LABELS[d.status]}, ${plural(d.reportCount, "report")}`,
              }))}
            />
          ) : (
            <Card variant="outline">
              <Card.Header>
                <Card.Title>{snapshot.description.title}</Card.Title>
                <Card.Description>
                  Sign in with GitHub to review and submit this report. Signing in is only needed to submit; the
                  draft stays here until {draft.expiresAt.toUTCString().replace(/:\d\d GMT$/, " UTC")}.
                </Card.Description>
              </Card.Header>
              <Card.Footer>
                {canSignIn() ? (
                  <SignInButton returnTo={returnTo} label="Sign in with GitHub to submit" />
                ) : (
                  <Text size="sm" color="muted">
                    GitHub sign-in is not configured on this deployment.
                  </Text>
                )}
              </Card.Footer>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Heading as="h2" size="lg" weight="semibold">
            What the report contains
          </Heading>
          <SnapshotView snapshot={snapshot} repro={checkRepro(snapshot)} />
        </div>
      </div>
    </div>
  );
}
