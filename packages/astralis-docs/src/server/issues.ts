import "server-only";

import { createHmac } from "node:crypto";
import { and, arrayContains, asc, count, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { checkSnapshot, LIMITS, type Snapshot } from "astralis-cli/snapshot";

import { fingerprintOf } from "@/lib/issues/fingerprint";
import type { IssueFilters } from "@/lib/issues/filters";
import { type IssueStatus, JOINABLE_STATUSES, OPEN_STATUSES, type Severity } from "@/lib/issues/model";

import { db } from "./db/client";
import { comments, drafts, events, issues, reports, user } from "./db/schema";

/* ---- limits ------------------------------------------------------------------------ */

/** A draft lives this long unless it is submitted first. */
const DRAFT_LIFETIME_HOURS = 24;

/**
 * Counted from the rows themselves, so a limit holds across server instances
 * and restarts without a table of its own.
 */
export const RATE_LIMITS = {
  draftsPerAddressPerHour: 30,
  reportsPerUserPerHour: 10,
  commentsPerUserPer10Minutes: 20,
} as const;

export const MAX_COMMENT_LENGTH = 5000;

/** A refusal the person can act on; the pages show its message as it is. */
export class IssueError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Whether the platform can take drafts and sign-ins at all. */
export const platformReady = (): boolean => Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET);

/**
 * A keyed hash of the sender's address. Enough to count their drafts; the
 * address itself is never stored, and without the secret the hash cannot be
 * reversed by trying every address.
 */
export function addressHash(address: string): string {
  return createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "").update(`draft-address:${address}`).digest("hex");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ---- drafts ------------------------------------------------------------------------- */

export async function createDraft(snapshot: Snapshot, address: string): Promise<string> {
  const hash = addressHash(address);
  const database = db();
  // Expired drafts go as the table is used, so nothing outlives its 24 hours
  // by more than the time until the next draft arrives.
  await database.delete(drafts).where(lt(drafts.expiresAt, sql`now()`));

  const [recent] = await database
    .select({ n: count() })
    .from(drafts)
    .where(and(eq(drafts.addressHash, hash), gt(drafts.createdAt, sql`now() - interval '1 hour'`)));
  if ((recent?.n ?? 0) >= RATE_LIMITS.draftsPerAddressPerHour) {
    throw new IssueError("Too many drafts from this address in the last hour. Try again later.", 429);
  }

  const [row] = await database
    .insert(drafts)
    .values({ snapshot, addressHash: hash, expiresAt: sql`now() + make_interval(hours => ${DRAFT_LIFETIME_HOURS})` })
    .returning({ id: drafts.id });
  return row.id;
}

export interface Draft {
  id: string;
  snapshot: Snapshot;
  expiresAt: Date;
}

/** A live draft, or null when the id is unknown, expired or already submitted. */
export async function readDraft(id: string): Promise<Draft | null> {
  if (!UUID.test(id)) return null;
  const [row] = await db()
    .select({ id: drafts.id, snapshot: drafts.snapshot, expiresAt: drafts.expiresAt })
    .from(drafts)
    .where(and(eq(drafts.id, id), gt(drafts.expiresAt, sql`now()`)));
  return row ?? null;
}

/* ---- issues ------------------------------------------------------------------------- */

export interface IssueSummary {
  id: string;
  githubNumber: number | null;
  title: string;
  status: IssueStatus;
  severity: Severity | null;
  component: string;
  ruleCodes: string[];
  assignment: "maintainer" | "contributors" | null;
  assignee: string | null;
  reportCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Where an issue lives: its GitHub number once it has one, its id until then. */
export const issueHref = (issue: { id: string; githubNumber: number | null }): string =>
  `/issues/${issue.githubNumber ?? issue.id}`;

// Spelled out: inside a raw subquery Drizzle renders a column without its
// table, and a bare "id" would bind to the subquery's own table.
const outerIssueId = sql.raw(`"issues"."id"`);
const reportCount = sql<number>`(select count(*)::int from "reports" r where r."issue_id" = ${outerIssueId})`;
const commentCount = sql<number>`(select count(*)::int from "comments" c where c."issue_id" = ${outerIssueId})`;

const summaryColumns = {
  id: issues.id,
  githubNumber: issues.githubNumber,
  title: issues.title,
  status: issues.status,
  severity: issues.severity,
  component: issues.component,
  ruleCodes: issues.ruleCodes,
  assignment: issues.assignment,
  assignee: issues.assignee,
  reportCount,
  commentCount,
  createdAt: issues.createdAt,
  updatedAt: issues.updatedAt,
};

/** Issues a report with this fingerprint can join, most reported first. */
export async function findDuplicates(fingerprint: string): Promise<IssueSummary[]> {
  return db()
    .select(summaryColumns)
    .from(issues)
    .where(and(eq(issues.fingerprint, fingerprint), inArray(issues.status, [...JOINABLE_STATUSES])))
    .orderBy(desc(reportCount), desc(issues.updatedAt))
    .limit(5);
}

export const PAGE_SIZE = 50;

/**
 * The public list. Critical issues that are still open come first, pinned;
 * the rest follow by latest activity.
 */
export async function listIssues(filters: IssueFilters, page = 1): Promise<{ issues: IssueSummary[]; more: boolean }> {
  const where = [];
  if (filters.status === "open") where.push(inArray(issues.status, [...OPEN_STATUSES]));
  else if (filters.status === "contributors") {
    where.push(eq(issues.assignment, "contributors"), inArray(issues.status, ["accepted", "in_progress", "fix_in_review"]));
  } else if (filters.status !== "all") where.push(eq(issues.status, filters.status));
  if (filters.component) where.push(eq(issues.component, filters.component));
  if (filters.rule) where.push(arrayContains(issues.ruleCodes, [filters.rule]));
  if (filters.severity) where.push(eq(issues.severity, filters.severity));

  const pinned = sql`case when ${issues.severity} = 'critical' and ${inArray(issues.status, [...OPEN_STATUSES])} then 0 else 1 end`;
  const rows = await db()
    .select(summaryColumns)
    .from(issues)
    .where(and(...where))
    .orderBy(asc(pinned), desc(issues.updatedAt))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);
  return { issues: rows.slice(0, PAGE_SIZE), more: rows.length > PAGE_SIZE };
}

/** The components and rule codes that issues name, for the list's filters. */
export async function filterOptions(): Promise<{ components: string[]; rules: string[] }> {
  const database = db();
  const [components, rules] = await Promise.all([
    database.selectDistinct({ name: issues.component }).from(issues).orderBy(issues.component),
    database.execute<{ code: string }>(sql`select distinct unnest(${issues.ruleCodes}) as code from ${issues} order by 1`),
  ]);
  return { components: components.map((c) => c.name), rules: [...rules].map((r) => r.code) };
}

export interface Person {
  login: string | null;
  name: string;
  image: string | null;
}

const person = (row: { login: string | null; name: string | null; image: string | null }): Person | null =>
  row.name === null ? null : { login: row.login, name: row.name, image: row.image };

export interface IssueDetail extends IssueSummary {
  fingerprint: string;
  reports: { id: string; snapshot: Snapshot; createdAt: Date; reporter: Person | null }[];
  comments: { id: string; body: string; createdAt: Date; author: Person | null }[];
  events: { id: string; kind: string; status: IssueStatus | null; createdAt: Date; actor: Person | null }[];
}

/** An issue by its GitHub number or its id, with everything its page shows. */
export async function getIssue(ref: string): Promise<IssueDetail | null> {
  const database = db();
  const by = /^\d{1,9}$/.test(ref) ? eq(issues.githubNumber, Number(ref)) : UUID.test(ref) ? eq(issues.id, ref) : null;
  if (!by) return null;
  const [issue] = await database
    .select({ ...summaryColumns, fingerprint: issues.fingerprint })
    .from(issues)
    .where(by);
  if (!issue) return null;

  const who = { login: user.login, name: user.name, image: user.image };
  const [reportRows, commentRows, eventRows] = await Promise.all([
    database
      .select({ id: reports.id, snapshot: reports.snapshot, createdAt: reports.createdAt, ...who })
      .from(reports)
      .leftJoin(user, eq(user.id, reports.reporterId))
      .where(eq(reports.issueId, issue.id))
      .orderBy(asc(reports.createdAt)),
    database
      .select({ id: comments.id, body: comments.body, createdAt: comments.createdAt, ...who })
      .from(comments)
      .leftJoin(user, eq(user.id, comments.authorId))
      .where(eq(comments.issueId, issue.id))
      .orderBy(asc(comments.createdAt)),
    database
      .select({ id: events.id, kind: events.kind, status: events.status, createdAt: events.createdAt, ...who })
      .from(events)
      .leftJoin(user, eq(user.id, events.actorId))
      .where(eq(events.issueId, issue.id))
      .orderBy(asc(events.createdAt)),
  ]);

  return {
    ...issue,
    reports: reportRows.map((r) => ({ id: r.id, snapshot: r.snapshot, createdAt: r.createdAt, reporter: person(r) })),
    comments: commentRows.map((c) => ({ id: c.id, body: c.body, createdAt: c.createdAt, author: person(c) })),
    events: eventRows.map((e) => ({ id: e.id, kind: e.kind, status: e.status, createdAt: e.createdAt, actor: person(e) })),
  };
}

/* ---- submitting --------------------------------------------------------------------- */

export interface Submission {
  draftId: string;
  userId: string;
  description: Snapshot["description"];
  /** Add the report to this issue instead of opening a new one. */
  joinIssueId?: string | null;
}

/**
 * Turn a draft into a report: on an existing issue with the same
 * fingerprint, or on a new issue. The reporter's edits to the description are
 * checked with the snapshot schema like the rest of it. One transaction, with
 * the draft locked, so a double submit cannot make two reports.
 */
export async function submitReport({ draftId, userId, description, joinIssueId }: Submission): Promise<{ id: string; githubNumber: number | null }> {
  if (!UUID.test(draftId)) throw new IssueError("This draft does not exist.", 404);
  return db().transaction(async (tx) => {
    const [draft] = await tx
      .select({ snapshot: drafts.snapshot })
      .from(drafts)
      .where(and(eq(drafts.id, draftId), gt(drafts.expiresAt, sql`now()`)))
      .for("update");
    if (!draft) throw new IssueError("This draft has expired or was already submitted.", 410);

    const [recent] = await tx
      .select({ n: count() })
      .from(reports)
      .where(and(eq(reports.reporterId, userId), gt(reports.createdAt, sql`now() - interval '1 hour'`)));
    if ((recent?.n ?? 0) >= RATE_LIMITS.reportsPerUserPerHour) {
      throw new IssueError("You have submitted many reports in the last hour. Try again later.", 429);
    }

    const snapshot: Snapshot = { ...draft.snapshot, description: tidyDescription(description) };
    const problems = checkSnapshot(snapshot);
    if (problems.length) throw new IssueError(problems.join("; "), 422);
    const print = fingerprintOf(snapshot);

    let target: { id: string; githubNumber: number | null };
    if (joinIssueId) {
      const [existing] = await tx
        .select({ id: issues.id, githubNumber: issues.githubNumber })
        .from(issues)
        .where(
          and(
            eq(issues.id, joinIssueId),
            eq(issues.fingerprint, print.value),
            inArray(issues.status, [...JOINABLE_STATUSES]),
          ),
        )
        .for("update");
      if (!existing) throw new IssueError("That issue no longer matches this report. Submit it as a new issue.", 409);
      target = existing;
      await tx.update(issues).set({ updatedAt: sql`now()` }).where(eq(issues.id, existing.id));
      await tx.insert(events).values({ issueId: existing.id, kind: "report_added", actorId: userId });
    } else {
      const [created] = await tx
        .insert(issues)
        .values({
          title: snapshot.description.title,
          component: print.component,
          ruleCodes: print.ruleCodes,
          fingerprint: print.value,
        })
        .returning({ id: issues.id, githubNumber: issues.githubNumber });
      target = created;
      await tx.insert(events).values({ issueId: created.id, kind: "opened", status: "new", actorId: userId });
    }

    await tx.insert(reports).values({ issueId: target.id, reporterId: userId, snapshot });
    await tx.delete(drafts).where(eq(drafts.id, draftId));
    return target;
  });
}

function tidyDescription(d: Snapshot["description"]): Snapshot["description"] {
  const out: Snapshot["description"] = { title: (d.title ?? "").trim() };
  const happened = d.happened?.trim();
  const expected = d.expected?.trim();
  if (happened) out.happened = happened;
  if (expected) out.expected = expected;
  return out;
}

export const DESCRIPTION_LIMITS = { title: LIMITS.title, body: LIMITS.body };

/* ---- comments ----------------------------------------------------------------------- */

export async function addComment(issueId: string, userId: string, text: string): Promise<void> {
  const body = text.trim();
  if (!body) throw new IssueError("A comment cannot be empty.", 422);
  if (body.length > MAX_COMMENT_LENGTH) throw new IssueError(`A comment is at most ${MAX_COMMENT_LENGTH} characters.`, 422);
  if (!UUID.test(issueId)) throw new IssueError("This issue does not exist.", 404);

  const database = db();
  const [recent] = await database
    .select({ n: count() })
    .from(comments)
    .where(and(eq(comments.authorId, userId), gt(comments.createdAt, sql`now() - interval '10 minutes'`)));
  if ((recent?.n ?? 0) >= RATE_LIMITS.commentsPerUserPer10Minutes) {
    throw new IssueError("You have commented a lot in the last few minutes. Try again shortly.", 429);
  }
  const [issue] = await database.select({ id: issues.id }).from(issues).where(eq(issues.id, issueId));
  if (!issue) throw new IssueError("This issue does not exist.", 404);
  await database.insert(comments).values({ issueId, authorId: userId, body });
  await database.update(issues).set({ updatedAt: sql`now()` }).where(eq(issues.id, issueId));
}

/* ---- the signed-in user's own activity ---------------------------------------------- */

export async function activityOf(userId: string): Promise<{ reports: IssueSummary[]; commentCount: number }> {
  const database = db();
  const [mine, [comm]] = await Promise.all([
    database
      .selectDistinct(summaryColumns)
      .from(issues)
      .innerJoin(reports, eq(reports.issueId, issues.id))
      .where(eq(reports.reporterId, userId))
      .orderBy(desc(issues.updatedAt))
      .limit(100),
    database.select({ n: count() }).from(comments).where(eq(comments.authorId, userId)),
  ]);
  return { reports: mine, commentCount: comm?.n ?? 0 };
}
