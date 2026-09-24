import { bigint, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { Snapshot } from "astralis-cli/snapshot";

import { ASSIGNMENTS, type EventKind, SEVERITIES, STATUSES } from "../../lib/issues/model";

import { user } from "./auth-schema";

export * from "./auth-schema";

// The issue platform's own tables (FYP report, Table 3.9). Every reference to
// a user is `set null` on delete: deleting an account removes the person, and
// their reports and comments stay with the issue, shown as a deleted user.

export const issueStatus = pgEnum("issue_status", STATUSES);
export const issueSeverity = pgEnum("issue_severity", SEVERITIES);
export const issueAssignment = pgEnum("issue_assignment", ASSIGNMENTS);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/**
 * Snapshots received before anyone signed in. The id is the only key to a
 * draft, so it is random and never listed; `addressHash` is a keyed hash of
 * the sender's address, kept only to rate-limit drafts.
 */
export const drafts = pgTable(
  "drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    snapshot: jsonb("snapshot").$type<Snapshot>().notNull(),
    addressHash: text("address_hash").notNull(),
    createdAt: createdAt(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("drafts_address_idx").on(t.addressHash, t.createdAt), index("drafts_expires_idx").on(t.expiresAt)],
);

export const issues = pgTable(
  "issues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Set once the issue exists on GitHub. */
    githubNumber: integer("github_number").unique(),
    title: text("title").notNull(),
    status: issueStatus("status").notNull().default("new"),
    severity: issueSeverity("severity"),
    /** The reported component, as the first report named it. */
    component: text("component").notNull(),
    ruleCodes: text("rule_codes").array().notNull().default([]),
    fingerprint: text("fingerprint").notNull(),
    assignment: issueAssignment("assignment"),
    /** GitHub username of whoever is fixing it. */
    assignee: text("assignee"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("issues_fingerprint_idx").on(t.fingerprint),
    index("issues_status_idx").on(t.status),
    index("issues_component_idx").on(t.component),
  ],
);

/** One per submitted snapshot; several reports of one problem share an issue. */
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    reporterId: text("reporter_id").references(() => user.id, { onDelete: "set null" }),
    snapshot: jsonb("snapshot").$type<Snapshot>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("reports_issue_idx").on(t.issueId), index("reports_reporter_idx").on(t.reporterId, t.createdAt)],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
    /** The comment's id on GitHub once mirrored, so it is never mirrored twice. */
    githubCommentId: bigint("github_comment_id", { mode: "number" }).unique(),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("comments_issue_idx").on(t.issueId, t.createdAt), index("comments_author_idx").on(t.authorId, t.createdAt)],
);

/** The issue's history, which its page shows as a timeline. */
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    kind: text("kind").$type<EventKind>().notNull(),
    /** The status the issue moved to, for status changes and the opening. */
    status: issueStatus("status"),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("events_issue_idx").on(t.issueId, t.createdAt)],
);
