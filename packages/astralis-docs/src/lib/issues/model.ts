/**
 * The issue platform's vocabulary: statuses, severities and assignments, with
 * the labels the pages show. Shared by the database schema, the pages and the
 * tests, so a status cannot exist in one place and not another.
 */

/** In workflow order; the last two are outcomes other than a fix. */
export const STATUSES = [
  "new",
  "triaged",
  "accepted",
  "in_progress",
  "fix_in_review",
  "fixed",
  "released",
  "declined",
  "duplicate",
] as const;
export type IssueStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  new: "New",
  triaged: "Triaged",
  accepted: "Accepted",
  in_progress: "In progress",
  fix_in_review: "Fix in review",
  fixed: "Fixed",
  released: "Released",
  declined: "Declined",
  duplicate: "Duplicate",
};

/** Statuses of an issue someone still has to act on. */
export const OPEN_STATUSES: readonly IssueStatus[] = [
  "new",
  "triaged",
  "accepted",
  "in_progress",
  "fix_in_review",
];

/**
 * Statuses a new report can join. A fixed issue is included: the fix is not
 * released yet, so someone on the current version still meets the problem,
 * and their report belongs with the issue rather than in a new one.
 */
export const JOINABLE_STATUSES: readonly IssueStatus[] = [...OPEN_STATUSES, "fixed"];

export const SEVERITIES = ["critical", "high", "normal", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  low: "Low",
};

/** Who fixes an accepted issue: the team, or any contributor who claims it. */
export const ASSIGNMENTS = ["maintainer", "contributors"] as const;
export type Assignment = (typeof ASSIGNMENTS)[number];

/** What an entry in an issue's timeline records. */
export const EVENT_KINDS = ["opened", "report_added", "status_changed"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const isStatus = (value: unknown): value is IssueStatus =>
  typeof value === "string" && (STATUSES as readonly string[]).includes(value);

export const isSeverity = (value: unknown): value is Severity =>
  typeof value === "string" && (SEVERITIES as readonly string[]).includes(value);

/** The repository issues are mirrored to. */
export const GITHUB_REPO = "sekiro-9/astralis-ui";
