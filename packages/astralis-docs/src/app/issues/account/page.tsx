import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar, Card, Heading, Text } from "astralis-ui";

import { plural } from "@/lib/issues/format";
import { AccountBar } from "@/modules/issues/account-bar";
import { DeleteAccountForm } from "@/modules/issues/delete-account-form";
import { IssueList } from "@/modules/issues/issue-list";
import { NotConfigured } from "@/modules/issues/not-configured";
import { auth, canSignIn, currentUser } from "@/server/auth";
import { isConfigured } from "@/server/db/client";
import { activityOf } from "@/server/issues";
import { headers } from "next/headers";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default async function AccountPage() {
  if (!isConfigured()) return <NotConfigured />;
  const user = await currentUser();
  if (!user) redirect("/issues");
  const [activity, session] = await Promise.all([
    activityOf(user.id),
    auth().api.getSession({ headers: await headers() }),
  ]);

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <header className="flex items-center justify-between gap-4">
        <Link href="/issues" className="text-sm text-label-muted hover:text-label">
          ← Issues &amp; Contributions
        </Link>
        <AccountBar user={user} canSignIn={canSignIn()} returnTo="/issues/account" />
      </header>

      <div className="flex items-center gap-4">
        <Avatar size="lg" src={user.image ?? undefined} name={user.name} />
        <div>
          <Heading as="h1" size="2xl" weight="semibold">
            {user.name}
          </Heading>
          {user.login && (
            <Text color="muted" size="sm">
              github.com/{user.login}
            </Text>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <Heading as="h2" size="lg" weight="semibold">
          What this site holds about you
        </Heading>
        <Text size="sm" lineHeight="relaxed">
          From your GitHub sign-in: your username, display name, avatar and email address (
          <span className="font-mono">{session?.user.email}</span>), which is never shown to anyone, and the
          access token GitHub issued at sign-in, used only to read that profile. Your{" "}
          {plural(activity.reports.length, "report")} and {plural(activity.commentCount, "comment")}, which are
          public. Nothing else: no analytics, and no record of the pages you read.
        </Text>
      </section>

      <section className="flex flex-col gap-3">
        <Heading as="h2" size="lg" weight="semibold">
          Your reports
        </Heading>
        {activity.reports.length ? (
          <IssueList issues={activity.reports} />
        ) : (
          <Text size="sm" color="muted">
            You have not submitted a report yet.
          </Text>
        )}
      </section>

      <Card variant="outline">
        <Card.Header>
          <Card.Title>Delete your account</Card.Title>
          <Card.Description>
            Removes your GitHub identity, email address and sign-ins from this site. Your reports and comments
            stay with their issues, because others rely on them, and show as from a deleted user.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <DeleteAccountForm confirmWord={user.login ?? user.name} />
        </Card.Body>
      </Card>
    </div>
  );
}
