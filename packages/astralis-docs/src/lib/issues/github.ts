import { checkSnapshot, type Snapshot } from "astralis-cli/snapshot";

/**
 * The Issues page's pure logic: what it keeps of GitHub's answers, its
 * filters, and how it reads a report out of an issue. No fetching here, so it
 * is tested without the network; ./fetch.ts does the fetching.
 */

/** The repository the issues live on. */
export const GITHUB_REPO = "sekiro-9/astralis-ui";
export const REPO_URL = `https://github.com/${GITHUB_REPO}`;

/** Labels the maintainers put on issues anyone may take on. */
export const CONTRIBUTOR_LABELS = ["good first issue", "help wanted"] as const;

export const PAGE_SIZE = 25;

export interface Label {
  name: string;
  /** Six hex digits, no "#", as GitHub gives it. */
  color: string;
}

export interface Person {
  login: string;
  avatar: string;
  url: string;
}

export type IssueState = "open" | "done" | "not-planned";

export interface IssueSummary {
  number: number;
  title: string;
  state: IssueState;
  url: string;
  author: Person | null;
  labels: Label[];
  comments: number;
  createdAt: string;
  updatedAt: string;
  /** The component a report from the DevTools or `astralis report` is about. */
  component: string | null;
}

/** A GitHub issue as the REST and search APIs return it; only the fields read here. */
export interface RawIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  state_reason?: string | null;
  html_url: string;
  user?: { login: string; avatar_url: string; html_url: string } | null;
  labels?: (string | { name?: string; color?: string })[];
  comments: number;
  created_at: string;
  updated_at: string;
  body?: string | null;
  body_html?: string;
  pull_request?: unknown;
}

const person = (user: RawIssue["user"]): Person | null =>
  user ? { login: user.login, avatar: user.avatar_url, url: user.html_url } : null;

export function stateOf(issue: Pick<RawIssue, "state" | "state_reason">): IssueState {
  if (issue.state === "open") return "open";
  return issue.state_reason === "not_planned" || issue.state_reason === "duplicate" ? "not-planned" : "done";
}

export function summarize(issue: RawIssue): IssueSummary {
  return {
    number: issue.number,
    title: issue.title,
    state: stateOf(issue),
    url: issue.html_url,
    author: person(issue.user),
    labels: (issue.labels ?? [])
      .map((label) => (typeof label === "string" ? { name: label, color: "8b8b8b" } : { name: label.name ?? "", color: label.color ?? "8b8b8b" }))
      .filter((label) => label.name),
    comments: issue.comments,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    component: componentOf(issue.body ?? ""),
  };
}

/* ---- reports ------------------------------------------------------------------- */

/** The component a report's issue names on its "- Component: `Card`" line. */
export function componentOf(body: string): string | null {
  return body.match(/^- Component: `([A-Za-z][\w.]{0,79})`$/m)?.[1] ?? null;
}

/**
 * The issue snapshot a report's issue carries, folded at the end of its body,
 * or null when the issue was written by hand or the snapshot does not check.
 */
export function snapshotOf(body: string): Snapshot | null {
  const start = body.indexOf("<summary>Issue snapshot (");
  if (start === -1) return null;
  const open = body.indexOf("```json\n", start);
  if (open === -1) return null;
  const close = body.indexOf("\n```", open + 8);
  if (close === -1) return null;
  try {
    const snapshot = JSON.parse(body.slice(open + 8, close));
    return checkSnapshot(snapshot).length === 0 ? (snapshot as Snapshot) : null;
  } catch {
    return null;
  }
}

/* ---- the list's filters ------------------------------------------------------------ */

export type StatusFilter = "open" | "contributors" | "closed" | "all";

export interface IssueFilters {
  status: StatusFilter;
  label: string | null;
  /** Free text, searched with GitHub's issue search. */
  q: string | null;
  page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseFilters(params: SearchParams): IssueFilters {
  const status = first(params.status);
  const label = first(params.label)?.trim();
  const q = first(params.q)?.replace(/\s+/g, " ").trim();
  const page = Number(first(params.page));
  return {
    status: status === "contributors" || status === "closed" || status === "all" ? status : "open",
    label: label && label.length <= 50 && !/["\\]/.test(label) ? label : null,
    // Search syntax stays the page's: quotes and qualifiers in the text are dropped.
    q: q ? q.replace(/\S+:\S*/g, "").replace(/["\\]/g, "").replace(/\s+/g, " ").trim().slice(0, 100).trim() || null : null,
    page: Number.isInteger(page) && page > 1 && page <= 40 ? page : 1,
  };
}

/** The list's URL for a set of filters, leaving out the defaults. */
export function filtersHref(filters: Partial<IssueFilters> & { status: StatusFilter }): string {
  const query = new URLSearchParams();
  if (filters.status !== "open") query.set("status", filters.status);
  if (filters.label) query.set("label", filters.label);
  if (filters.q) query.set("q", filters.q);
  if (filters.page && filters.page > 1) query.set("page", String(filters.page));
  const text = query.toString();
  return text ? `/issues?${text}` : "/issues";
}

/**
 * The GitHub search query for a set of filters. The list is always a search:
 * the plain issues list counts pull requests in every page, and cannot ask
 * for the contributor labels as an OR.
 */
export function searchQuery(filters: IssueFilters): string {
  const parts = [`repo:${GITHUB_REPO}`, "is:issue"];
  if (filters.status === "open" || filters.status === "contributors") parts.push("is:open");
  if (filters.status === "closed") parts.push("is:closed");
  if (filters.status === "contributors") parts.push(`label:${CONTRIBUTOR_LABELS.map((l) => `"${l}"`).join(",")}`);
  if (filters.label) parts.push(`label:"${filters.label}"`);
  if (filters.q) parts.push(filters.q);
  return parts.join(" ");
}
