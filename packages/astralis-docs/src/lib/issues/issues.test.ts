import { describe, expect, it } from "vitest";
import { issueFromSnapshot } from "astralis-cli/github";
import type { Snapshot } from "astralis-cli/snapshot";

import { formatDate, plural } from "./format";
import { componentOf, filtersHref, parseFilters, type RawIssue, searchQuery, snapshotOf, stateOf, summarize } from "./github";

/* The Issues page's reading of GitHub: issues, reports in them, and the list's filters. */

const SNAPSHOT: Snapshot = {
  format: "astralis-snapshot/1",
  source: "devtools",
  library: { name: "astralis-ui", version: "0.8.0", specVersion: 3, specSha256: "a".repeat(64) },
  environment: { framework: { name: "next", version: "16.3.3" }, react: "19.2.8", browser: "Chrome 140", viewport: { width: 1280, height: 800 }, colorMode: "dark" },
  route: "/about",
  tree: [{ component: "Card.Body", props: {}, client: "none", children: [{ redacted: true, length: 5 }] }],
  findings: [{ code: "invalid-recipe-value", file: "app/about/page.tsx", line: 3, column: 16, message: 'Card: "glass" is not a variant value' }],
  description: { title: "Card loses its border", happened: "No border in dark mode" },
};

const raw = (extra: Partial<RawIssue> = {}): RawIssue => ({
  number: 12,
  title: "Card loses its border",
  state: "open",
  html_url: "https://github.com/sekiro-9/astralis-ui/issues/12",
  user: { login: "sam", avatar_url: "https://avatars.githubusercontent.com/u/1", html_url: "https://github.com/sam" },
  labels: [{ name: "bug", color: "d73a4a" }, "needs triage"],
  comments: 2,
  created_at: "2026-10-01T09:00:00Z",
  updated_at: "2026-10-03T09:00:00Z",
  body: issueFromSnapshot(SNAPSHOT).body,
  ...extra,
});

describe("reading a report out of its issue", () => {
  it("finds the snapshot a report's issue carries, exactly as sent", () => {
    expect(snapshotOf(issueFromSnapshot(SNAPSHOT).body)).toEqual(SNAPSHOT);
  });

  it("finds nothing in an issue written by hand, or a snapshot that does not check", () => {
    expect(snapshotOf("Steps to reproduce:\n\n1. Open the page")).toBeNull();
    const broken = issueFromSnapshot(SNAPSHOT).body.replace('"astralis-snapshot/1"', '"other/9"');
    expect(snapshotOf(broken)).toBeNull();
  });

  it("names the component a report is about", () => {
    expect(componentOf(issueFromSnapshot(SNAPSHOT).body)).toBe("Card.Body");
    expect(componentOf("- Component: `<script>`")).toBeNull();
  });
});

describe("an issue as the list shows it", () => {
  it("keeps what the list needs, with labels in their colours", () => {
    expect(summarize(raw())).toEqual({
      number: 12,
      title: "Card loses its border",
      state: "open",
      url: "https://github.com/sekiro-9/astralis-ui/issues/12",
      author: { login: "sam", avatar: "https://avatars.githubusercontent.com/u/1", url: "https://github.com/sam" },
      labels: [
        { name: "bug", color: "d73a4a" },
        { name: "needs triage", color: "8b8b8b" },
      ],
      comments: 2,
      createdAt: "2026-10-01T09:00:00Z",
      updatedAt: "2026-10-03T09:00:00Z",
      component: "Card.Body",
    });
  });

  it("tells a fix from a closed-without-one", () => {
    expect(stateOf({ state: "open" })).toBe("open");
    expect(stateOf({ state: "closed", state_reason: "completed" })).toBe("done");
    expect(stateOf({ state: "closed", state_reason: "not_planned" })).toBe("not-planned");
    expect(stateOf({ state: "closed", state_reason: "duplicate" })).toBe("not-planned");
  });
});

describe("the list's filters", () => {
  it("defaults to open issues, and ignores what it does not know", () => {
    expect(parseFilters({})).toEqual({ status: "open", label: null, q: null, page: 1 });
    expect(parseFilters({ status: "nope", page: "-3", label: 'x" OR "y' })).toEqual({ status: "open", label: null, q: null, page: 1 });
  });

  it("keeps search to words: quotes and qualifiers from the URL are dropped", () => {
    expect(parseFilters({ q: '  Card   "border" repo:evil/x author:me ' }).q).toBe("Card border");
    expect(parseFilters({ q: "x".repeat(300) }).q).toHaveLength(100);
  });

  it("round-trips through the URL, leaving out the defaults", () => {
    const filters = parseFilters({ status: "closed", label: "bug", q: "Card", page: "2" });
    expect(filtersHref(filters)).toBe("/issues?status=closed&label=bug&q=Card&page=2");
    expect(parseFilters(Object.fromEntries(new URL(filtersHref(filters), "https://x").searchParams))).toEqual(filters);
    expect(filtersHref({ status: "open" })).toBe("/issues");
  });

  it("asks GitHub's issue search for exactly the filters", () => {
    expect(searchQuery(parseFilters({}))).toBe("repo:sekiro-9/astralis-ui is:issue is:open");
    expect(searchQuery(parseFilters({ status: "closed", label: "bug" }))).toBe('repo:sekiro-9/astralis-ui is:issue is:closed label:"bug"');
    expect(searchQuery(parseFilters({ q: "Card" }))).toBe("repo:sekiro-9/astralis-ui is:issue is:open Card");
    expect(searchQuery(parseFilters({ status: "contributors" }))).toBe(
      'repo:sekiro-9/astralis-ui is:issue is:open label:"good first issue","help wanted"',
    );
    expect(searchQuery(parseFilters({ status: "all", label: "bug", q: "Tabs" }))).toBe('repo:sekiro-9/astralis-ui is:issue label:"bug" Tabs');
  });
});

describe("formatting", () => {
  it("dates in UTC, from a string or a Date", () => {
    expect(formatDate("2026-09-26T23:30:00Z")).toBe("26 Sep 2026");
    expect(formatDate(new Date(Date.UTC(2026, 0, 2)))).toBe("2 Jan 2026");
    expect(plural(1, "comment")).toBe("1 comment");
  });
});
