import "server-only";

import {
  GITHUB_REPO,
  PAGE_SIZE,
  type IssueFilters,
  type IssueSummary,
  type Label,
  type Person,
  type RawIssue,
  searchQuery,
  stateOf,
  summarize,
} from "./github";

/**
 * Reading the issues from GitHub, on the server. Every answer is cached for a
 * minute, so a busy page costs GitHub a request a minute, not one a visit.
 * GITHUB_TOKEN, optional, is a read-only token that lifts GitHub's limit of
 * 60 unauthenticated requests an hour; the site reads public data either way.
 */

const API = "https://api.github.com";
const REVALIDATE_SECONDS = 60;

export class GitHubUnavailable extends Error {}

async function github<T>(path: string, { html = false } = {}): Promise<{ data: T }> {
  const token = process.env.GITHUB_TOKEN;
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      headers: {
        accept: html ? "application/vnd.github.full+json" : "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "astralis-docs",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (error) {
    throw new GitHubUnavailable(`GitHub could not be reached (${(error as Error).message}).`);
  }
  if (response.status === 404) return { data: null as T };
  if (!response.ok) {
    const limited = response.status === 403 || response.status === 429;
    throw new GitHubUnavailable(limited ? "GitHub's rate limit for this site is used up for now." : `GitHub answered ${response.status}.`);
  }
  return { data: (await response.json()) as T };
}

export async function listIssues(filters: IssueFilters): Promise<{ issues: IssueSummary[]; more: boolean }> {
  const query = new URLSearchParams({ q: searchQuery(filters), sort: "updated", order: "desc", per_page: String(PAGE_SIZE), page: String(filters.page) });
  const { data } = await github<{ total_count: number; items: RawIssue[] }>(`/search/issues?${query}`);
  return { issues: (data?.items ?? []).map(summarize), more: (data?.total_count ?? 0) > filters.page * PAGE_SIZE };
}

export async function listLabels(): Promise<Label[]> {
  const { data } = await github<{ name: string; color: string }[]>(`/repos/${GITHUB_REPO}/labels?per_page=100`);
  return (data ?? []).map(({ name, color }) => ({ name, color }));
}

export interface Comment {
  id: number;
  author: Person | null;
  createdAt: string;
  /** GitHub's own rendering of the comment, sanitised by GitHub. */
  html: string;
  url: string;
}

export interface IssueDetail extends IssueSummary {
  body: string;
  /** GitHub's own rendering of the body, sanitised by GitHub. */
  html: string;
  thread: Comment[];
}

/** One issue with its comments, or null when there is no such issue (or it is a pull request). */
export async function getIssue(number: number): Promise<IssueDetail | null> {
  const { data: issue } = await github<RawIssue | null>(`/repos/${GITHUB_REPO}/issues/${number}`, { html: true });
  if (!issue || issue.pull_request) return null;
  type RawComment = { id: number; user: RawIssue["user"]; created_at: string; body_html?: string; html_url: string };
  const { data: comments } = issue.comments
    ? await github<RawComment[]>(`/repos/${GITHUB_REPO}/issues/${number}/comments?per_page=100`, { html: true })
    : { data: [] as RawComment[] };
  return {
    ...summarize(issue),
    state: stateOf(issue),
    body: issue.body ?? "",
    html: issue.body_html ?? "",
    thread: (comments ?? []).map((c) => ({
      id: c.id,
      author: c.user ? { login: c.user.login, avatar: c.user.avatar_url, url: c.user.html_url } : null,
      createdAt: c.created_at,
      html: c.body_html ?? "",
      url: c.html_url,
    })),
  };
}
