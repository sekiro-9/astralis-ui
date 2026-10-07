/* ==========================================================================
   Reporting to GitHub: sign-in, the saved sign-in, and the issues.
   --------------------------------------------------------------------------
   A report becomes an issue on the Astralis repository, opened by the
   reporter's own GitHub account. Sign-in is GitHub's device flow through the
   Astralis DevTools GitHub App: the reporter enters a short code on
   github.com, and the app can do one thing, read and write issues on the
   Astralis repository. It needs no client secret, so none ships here.

   The token is saved in a file only the user can read, in their config
   directory, and is shared by `astralis report` and the DevTools bridge. It
   never reaches a web page: both run in Node and call GitHub themselves.
   ========================================================================== */

import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { LIMITS, toRepro } from "./snapshot.mjs";

/** The Astralis DevTools GitHub App. Public by design: the device flow has no secret. */
export const GITHUB_CLIENT_ID = "";

/** Where reports go. */
export const ISSUES_REPO = "sekiro-9/astralis-ui";

/** github.com and its API; ASTRALIS_GITHUB_URL and ASTRALIS_GITHUB_API_URL override them, for tests. */
const web = () => process.env.ASTRALIS_GITHUB_URL || "https://github.com";
const api = () => process.env.ASTRALIS_GITHUB_API_URL || "https://api.github.com";
/** GitHub refuses an issue body longer than this. */
const MAX_BODY = 65536;
/** The longest new-issue link GitHub and browsers reliably take. */
const MAX_URL = 8000;

/** The app's client ID; ASTRALIS_GITHUB_CLIENT_ID overrides it, for testing against another app. */
export const clientId = () => process.env.ASTRALIS_GITHUB_CLIENT_ID || GITHUB_CLIENT_ID;
/** The repository; ASTRALIS_ISSUES_REPO overrides it, for testing against another repository. */
export const issuesRepo = () => process.env.ASTRALIS_ISSUES_REPO || ISSUES_REPO;

/** An error a person can act on, with a code a program can branch on. */
export class GitHubError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/* ---- the saved sign-in ------------------------------------------------------------- */

/** The user's config directory for Astralis: %APPDATA%\astralis on Windows, else $XDG_CONFIG_HOME or ~/.config. */
export function configDir(env = process.env) {
  if (env.ASTRALIS_CONFIG_DIR) return env.ASTRALIS_CONFIG_DIR;
  if (process.platform === "win32" && env.APPDATA) return join(env.APPDATA, "astralis");
  return join(env.XDG_CONFIG_HOME || join(homedir(), ".config"), "astralis");
}

/** The saved GitHub sign-in: { token, login, savedAt }, or null. */
export function tokenStore(dir = configDir()) {
  const file = join(dir, "github.json");
  return {
    file,
    read() {
      try {
        const saved = JSON.parse(readFileSync(file, "utf8"));
        return typeof saved?.token === "string" && typeof saved?.login === "string" ? saved : null;
      } catch {
        return null;
      }
    },
    write({ token, login }) {
      mkdirSync(dir, { recursive: true, mode: 0o700 });
      writeFileSync(file, `${JSON.stringify({ token, login, savedAt: new Date().toISOString() }, null, 2)}\n`, { mode: 0o600 });
      // writeFileSync keeps an existing file's mode; make sure it is the user's alone.
      try {
        chmodSync(file, 0o600);
      } catch {
        // Windows: the file sits in the user's own profile, which is theirs alone
      }
    },
    clear() {
      rmSync(file, { force: true });
    },
  };
}

/* ---- talking to GitHub ------------------------------------------------------------- */

async function call(fetchImpl, url, { method = "GET", token, body, form } = {}) {
  const isApi = url.startsWith(api());
  let response;
  try {
    response = await fetchImpl(url, {
      method,
      headers: {
        accept: isApi ? "application/vnd.github+json" : "application/json",
        "user-agent": "astralis-cli",
        ...(isApi ? { "x-github-api-version": "2022-11-28" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body ? { "content-type": "application/json" } : {}),
        ...(form ? { "content-type": "application/x-www-form-urlencoded" } : {}),
      },
      body: body ? JSON.stringify(body) : form ? new URLSearchParams(form).toString() : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    throw new GitHubError("network", `Could not reach GitHub (${error.name === "TimeoutError" ? "timed out" : error.message}).`);
  }
  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body
  }
  if (response.status === 401) throw new GitHubError("signed-out", "GitHub no longer accepts this sign-in. Sign in again.");
  if (!response.ok) {
    const reason = data?.message ?? `${response.status} ${response.statusText}`.trim();
    throw new GitHubError(response.status === 403 || response.status === 404 ? "forbidden" : "github", `GitHub refused the request: ${reason}.`);
  }
  return data;
}

/**
 * Start a sign-in. Resolves to the code the user enters, the page they enter
 * it on, and the device code to poll with (which stays in this process).
 */
export async function startSignIn({ fetchImpl = globalThis.fetch } = {}) {
  const id = clientId();
  if (!id) throw new GitHubError("not-configured", "GitHub sign-in is not set up in this version of astralis-cli.");
  const data = await call(fetchImpl, `${web()}/login/device/code`, { method: "POST", form: { client_id: id } });
  if (data?.error) throw new GitHubError("github", `GitHub could not start the sign-in: ${data.error_description ?? data.error}.`);
  return {
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    expiresAt: Date.now() + data.expires_in * 1000,
    interval: data.interval ?? 5,
  };
}

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

/**
 * Wait for the user to enter the code. Resolves to { token, login } once they
 * have; rejects with code "expired" or "denied" when they will not.
 */
export async function finishSignIn(flow, { fetchImpl = globalThis.fetch, sleep = wait, signal } = {}) {
  let interval = flow.interval;
  while (Date.now() < flow.expiresAt) {
    await sleep(interval * 1000);
    if (signal?.aborted) throw new GitHubError("cancelled", "The sign-in was cancelled.");
    const data = await call(fetchImpl, `${web()}/login/oauth/access_token`, {
      method: "POST",
      form: { client_id: clientId(), device_code: flow.deviceCode, grant_type: "urn:ietf:params:oauth:grant-type:device_code" },
    });
    if (data?.access_token) {
      const user = await call(fetchImpl, `${api()}/user`, { token: data.access_token });
      return { token: data.access_token, login: user.login };
    }
    switch (data?.error) {
      case "authorization_pending":
        continue;
      case "slow_down":
        interval = data.interval ?? interval + 5;
        continue;
      case "expired_token":
        throw new GitHubError("expired", "The code expired before it was entered. Start the sign-in again.");
      case "access_denied":
        throw new GitHubError("denied", "The sign-in was declined on GitHub.");
      default:
        throw new GitHubError("github", `GitHub ended the sign-in: ${data?.error_description ?? data?.error ?? "no reason given"}.`);
    }
  }
  throw new GitHubError("expired", "The code expired before it was entered. Start the sign-in again.");
}

/** Open an issue on the Astralis repository as the signed-in user. Resolves to { number, url }. */
export async function createIssue(token, { title, body }, { fetchImpl = globalThis.fetch } = {}) {
  const issue = await call(fetchImpl, `${api()}/repos/${issuesRepo()}/issues`, { method: "POST", token, body: { title, body } });
  return { number: issue.number, url: issue.html_url };
}

/** Add a report to an existing issue, as a comment. Resolves to { number, url }. */
export async function commentOnIssue(token, number, body, { fetchImpl = globalThis.fetch } = {}) {
  const comment = await call(fetchImpl, `${api()}/repos/${issuesRepo()}/issues/${number}/comments`, { method: "POST", token, body: { body } });
  return { number, url: comment.html_url };
}

const summary = (issue) => ({
  number: issue.number,
  title: issue.title,
  state: issue.state,
  stateReason: issue.state_reason ?? null,
  url: issue.html_url,
  comments: issue.comments,
  labels: (issue.labels ?? []).map((label) => (typeof label === "string" ? label : label.name)),
  createdAt: issue.created_at,
  updatedAt: issue.updated_at,
});

/** The issues `login` opened on the Astralis repository, most recently updated first. */
export async function listIssues(token, login, { fetchImpl = globalThis.fetch } = {}) {
  const query = new URLSearchParams({ creator: login, state: "all", sort: "updated", per_page: "50" });
  const list = await call(fetchImpl, `${api()}/repos/${issuesRepo()}/issues?${query}`, { token });
  return (list ?? []).filter((issue) => !issue.pull_request).map(summary);
}

/* ---- duplicates -------------------------------------------------------------------- */

/**
 * The keys a report is matched on, written into every issue it opens so
 * GitHub's search can find them again. `fingerprint` is the same problem: the
 * same component, the same rule codes in its findings, and the same minor
 * version of astralis-ui. `component` is the same component, whatever else.
 * Each is one word, so a search matches it exactly.
 */
export function matchKeys(snapshot) {
  const component = snapshot.tree?.[0]?.component ?? null;
  if (!component) return { fingerprint: null, component: null };
  const codes = [...new Set((snapshot.findings ?? []).map((f) => f.code))].sort();
  const minor = (snapshot.library?.version ?? "").split(".").slice(0, 2).join(".");
  const hash = createHash("sha256").update(JSON.stringify([component, codes, minor])).digest("hex").slice(0, 12);
  return { fingerprint: `afp${hash}`, component: `acmp${component.replace(/[^A-Za-z0-9]/g, "").toLowerCase()}` };
}

async function search(token, q, fetchImpl) {
  const query = new URLSearchParams({ q: `repo:${issuesRepo()} is:issue ${q}`, sort: "updated", per_page: "10" });
  const found = await call(fetchImpl, `${api()}/search/issues?${query}`, { token });
  return (found?.items ?? []).filter((issue) => !issue.pull_request).map(summary);
}

/**
 * Issues that may already report this problem. `duplicates`: the same
 * fingerprint, open first. `related`: other open issues about the same
 * component, at most three.
 */
export async function findSimilar(token, snapshot, { fetchImpl = globalThis.fetch } = {}) {
  const keys = matchKeys(snapshot);
  if (!keys.fingerprint) return { duplicates: [], related: [] };
  const [duplicates, sameComponent] = await Promise.all([
    search(token, keys.fingerprint, fetchImpl),
    search(token, `is:open ${keys.component}`, fetchImpl),
  ]);
  duplicates.sort((a, b) => (a.state === b.state ? 0 : a.state === "open" ? -1 : 1));
  const seen = new Set(duplicates.map((issue) => issue.number));
  return { duplicates, related: sameComponent.filter((issue) => !seen.has(issue.number)).slice(0, 3) };
}

/* ---- a snapshot as an issue --------------------------------------------------------- */

const fence = (lang, text) => {
  const ticks = "`".repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map((m) => m[0].length + 1)));
  return `${ticks}${lang}\n${text}\n${ticks}`;
};

/**
 * The issue a snapshot becomes: the reporter's words first, then where it
 * happened, the validator's findings, a reproduction, and the snapshot itself.
 * A screenshot is never in the body (GitHub's API cannot attach images).
 */
export function issueFromSnapshot(snapshot) {
  return composeIssue(snapshot, {
    fits: (body) => body.length <= MAX_BODY,
    tooLarge: "_The snapshot was too large to include in full._",
  });
}

/**
 * GitHub's own new-issue form for a snapshot, pre-filled: the way to report
 * without signing in to the app, since the reporter submits it on github.com
 * as themselves. A link holds about 8 kB, so the snapshot's JSON is the first
 * thing left out, then the body is cut; the report's words always come first.
 */
export function newIssueUrl(snapshot) {
  const base = `https://github.com/${issuesRepo()}/issues/new`;
  const url = (title, body) => `${base}?${new URLSearchParams({ title, body })}`;
  const { title, body } = composeIssue(snapshot, {
    fits: (text) => url(snapshot.description?.title ?? "", text).length <= MAX_URL,
    tooLarge: "_The full snapshot does not fit in a link: attach the file from Download, or send from the DevTools signed in._",
  });
  return url(title, body);
}

function composeIssue(snapshot, { fits, tooLarge }) {
  const d = snapshot.description ?? {};
  const lib = snapshot.library ?? {};
  const env = snapshot.environment ?? {};
  const where = [
    `astralis-ui ${lib.version ?? "?"} (spec ${lib.specVersion ?? "?"})`,
    env.framework?.name ? `${env.framework.name === "next" ? "Next.js" : env.framework.name === "vite" ? "Vite" : env.framework.name} ${env.framework.version ?? ""}`.trim() : null,
    env.react ? `React ${env.react}` : null,
    env.browser,
    env.viewport ? `${env.viewport.width}×${env.viewport.height}` : null,
    env.colorMode ? `${env.colorMode} mode` : null,
  ].filter(Boolean);
  const top = snapshot.tree?.[0]?.component;
  const how = snapshot.source === "cli" ? "`astralis report`" : "the Astralis DevTools";

  const parts = [];
  if (d.happened) parts.push("### What happened", d.happened);
  if (d.expected) parts.push("### What I expected", d.expected);
  parts.push(
    "### Where",
    [`- ${where.join(" · ")}`, snapshot.route ? `- Page: \`${snapshot.route}\`` : null, top ? `- Component: \`${top}\`` : null].filter(Boolean).join("\n"),
  );
  if (snapshot.findings?.length) {
    parts.push(
      "### Validator findings",
      snapshot.findings
        .slice(0, LIMITS.findings)
        .map((f) => `- \`${f.code}\` ${f.file}:${f.line}:${f.column}: ${f.message}`)
        .join("\n"),
    );
  }
  if (snapshot.console?.length) parts.push("### Console errors", fence("text", snapshot.console.join("\n")));
  parts.push("### Reproduction", fence("tsx", toRepro(snapshot)));

  const keys = matchKeys(snapshot);
  const footer = `<sub>Reported with ${how}.${keys.fingerprint ? ` Match keys: ${keys.fingerprint} ${keys.component}` : ""}</sub>`;
  const { screenshot: _shot, ...rest } = snapshot;
  const json = `<details>\n<summary>Issue snapshot (${snapshot.format})</summary>\n\n${fence("json", JSON.stringify(rest, null, 2))}\n\n</details>`;
  let body = [...parts, json, footer].join("\n\n");
  if (!fits(body)) body = [...parts, tooLarge, footer].join("\n\n");
  if (!fits(body)) {
    // Cut the words, keeping the note and the footer, with its match keys, whole.
    const whole = parts.join("\n\n");
    let keep = whole.length;
    do {
      keep = Math.floor(keep * 0.85);
      body = `${whole.slice(0, keep)}…\n\n${tooLarge}\n\n${footer}`;
    } while (!fits(body) && keep > 100);
  }
  return { title: (d.title ?? "").trim().slice(0, LIMITS.title), body };
}

/** A report added to an existing issue: the same content, marked as another report. */
export function commentFromSnapshot(snapshot) {
  const { title, body } = issueFromSnapshot(snapshot);
  return `**Another report of this problem:** ${title}\n\n${body}`;
}
