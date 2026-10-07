import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GitHubError, createIssue, finishSignIn, issueFromSnapshot, listIssues, startSignIn, tokenStore } from "astralis-cli/github";

/* Reporting to GitHub, with GitHub stubbed at fetch. */

process.env.ASTRALIS_GITHUB_CLIENT_ID = "Iv1.test";

/** A fetch that answers each call with the next of `replies` ({ status?, body }), recording the requests. */
function scripted(replies) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    const { status = 200, body } = replies.shift() ?? { status: 500, body: {} };
    return new Response(JSON.stringify(body), { status });
  };
  return { calls, fetchImpl };
}

const flow = (extra = {}) => ({ deviceCode: "d", userCode: "U-1", verificationUri: "https://github.com/login/device", expiresAt: Date.now() + 60_000, interval: 5, ...extra });

test("startSignIn asks GitHub for a code with the app's client ID only", async () => {
  const { calls, fetchImpl } = scripted([{ body: { device_code: "d", user_code: "WDJB-MJHT", verification_uri: "https://github.com/login/device", expires_in: 900, interval: 5 } }]);
  const started = await startSignIn({ fetchImpl });
  assert.equal(calls[0].url, "https://github.com/login/device/code");
  assert.equal(calls[0].init.body, "client_id=Iv1.test");
  assert.equal(started.userCode, "WDJB-MJHT");
  assert.ok(started.expiresAt > Date.now());
});

test("startSignIn without a configured app says so", async () => {
  const saved = process.env.ASTRALIS_GITHUB_CLIENT_ID;
  process.env.ASTRALIS_GITHUB_CLIENT_ID = "";
  try {
    await assert.rejects(startSignIn({ fetchImpl: async () => assert.fail("no request") }), (error) => error.code === "not-configured");
  } finally {
    process.env.ASTRALIS_GITHUB_CLIENT_ID = saved;
  }
});

test("finishSignIn waits through pending and slow_down, then returns the token and login", async () => {
  const waits = [];
  const { calls, fetchImpl } = scripted([
    { body: { error: "authorization_pending" } },
    { body: { error: "slow_down", interval: 10 } },
    { body: { access_token: "tok" } },
    { body: { login: "sam" } },
  ]);
  const result = await finishSignIn(flow(), { fetchImpl, sleep: async (ms) => waits.push(ms) });
  assert.deepEqual(result, { token: "tok", login: "sam" });
  assert.deepEqual(waits, [5000, 5000, 10000], "slow_down lengthens the wait");
  assert.equal(calls[3].init.headers.authorization, "Bearer tok");
  assert.match(calls[0].init.body, /grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Adevice_code/);
});

test("finishSignIn ends on a declined, an expired or a stale code", async () => {
  const sleep = async () => {};
  const denied = scripted([{ body: { error: "access_denied" } }]);
  await assert.rejects(finishSignIn(flow(), { fetchImpl: denied.fetchImpl, sleep }), (e) => e instanceof GitHubError && e.code === "denied");
  const expired = scripted([{ body: { error: "expired_token" } }]);
  await assert.rejects(finishSignIn(flow(), { fetchImpl: expired.fetchImpl, sleep }), (e) => e.code === "expired");
  await assert.rejects(finishSignIn(flow({ expiresAt: Date.now() - 1 }), { fetchImpl: async () => assert.fail("no poll"), sleep }), (e) => e.code === "expired");
});

test("createIssue posts to the Astralis repository; a revoked token is reported as signed out", async () => {
  const { calls, fetchImpl } = scripted([{ status: 201, body: { number: 3, html_url: "https://github.com/sekiro-9/astralis-ui/issues/3" } }]);
  assert.deepEqual(await createIssue("tok", { title: "t", body: "b" }, { fetchImpl }), { number: 3, url: "https://github.com/sekiro-9/astralis-ui/issues/3" });
  assert.equal(calls[0].url, "https://api.github.com/repos/sekiro-9/astralis-ui/issues");
  assert.deepEqual(JSON.parse(calls[0].init.body), { title: "t", body: "b" });
  assert.equal(calls[0].init.headers["x-github-api-version"], "2022-11-28");
  const revoked = scripted([{ status: 401, body: { message: "Bad credentials" } }]);
  await assert.rejects(createIssue("old", { title: "t", body: "b" }, { fetchImpl: revoked.fetchImpl }), (e) => e.code === "signed-out");
});

test("listIssues lists the user's issues, not their pull requests", async () => {
  const { calls, fetchImpl } = scripted([
    {
      body: [
        { number: 9, title: "Card", state: "closed", state_reason: "completed", html_url: "u9", comments: 2, labels: [{ name: "bug" }], created_at: "a", updated_at: "b" },
        { number: 8, title: "A PR", state: "open", pull_request: {}, html_url: "u8", labels: [] },
      ],
    },
  ]);
  const list = await listIssues("tok", "sam", { fetchImpl });
  assert.match(calls[0].url, /\/repos\/sekiro-9\/astralis-ui\/issues\?creator=sam&state=all/);
  assert.deepEqual(list, [{ number: 9, title: "Card", state: "closed", stateReason: "completed", url: "u9", comments: 2, labels: ["bug"], createdAt: "a", updatedAt: "b" }]);
});

test("the saved sign-in lives in a file only the user can read", () => {
  const dir = mkdtempSync(join(tmpdir(), "astralis-github-"));
  try {
    const store = tokenStore(join(dir, "astralis"));
    assert.equal(store.read(), null);
    store.write({ token: "tok", login: "sam" });
    assert.deepEqual((({ token, login }) => ({ token, login }))(store.read()), { token: "tok", login: "sam" });
    if (process.platform !== "win32") assert.equal(statSync(store.file).mode & 0o777, 0o600);
    store.clear();
    assert.equal(store.read(), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

const SNAPSHOT = {
  format: "astralis-snapshot/1",
  source: "devtools",
  library: { name: "astralis-ui", version: "0.8.0", specVersion: 3 },
  environment: { framework: { name: "next", version: "16.3.3" }, react: "19.2.8", browser: "Chrome 140", viewport: { width: 1280, height: 800 }, colorMode: "dark" },
  route: "/about",
  tree: [{ component: "Card", props: { variant: "outline" }, children: [{ redacted: true, length: 5 }] }],
  findings: [{ code: "invalid-recipe-value", file: "app/about/page.tsx", line: 3, column: 16, message: 'Card: "glass" is not a variant value' }],
  description: { title: " Card loses its border ", happened: "No border in dark mode" },
  screenshot: "data:image/jpeg;base64,AAAA",
};

test("a snapshot becomes an issue: the reporter's words, where, findings, a reproduction and the snapshot, never the screenshot", () => {
  const { title, body } = issueFromSnapshot(SNAPSHOT);
  assert.equal(title, "Card loses its border");
  assert.match(body, /^### What happened\n\nNo border in dark mode\n\n### Where\n\n- astralis-ui 0\.8\.0 \(spec 3\) · Next\.js 16\.3\.3 · React 19\.2\.8 · Chrome 140 · 1280×800 · dark mode\n- Page: `\/about`\n- Component: `Card`/);
  assert.doesNotMatch(body, /What I expected/, "an empty answer is left out");
  assert.match(body, /- `invalid-recipe-value` app\/about\/page\.tsx:3:16: Card: "glass" is not a variant value/);
  assert.match(body, /```tsx\n[\s\S]*<Card variant="outline">/);
  assert.doesNotMatch(body, /base64/);
  assert.match(body, /<sub>Reported with the Astralis DevTools\. Match keys: afp[0-9a-f]{12} acmpcard<\/sub>$/);
});

test("a snapshot too large for GitHub keeps everything but the raw JSON", () => {
  const big = { ...SNAPSHOT, tree: Array.from({ length: 300 }, (_, i) => ({ component: "Text", props: { note: "x".repeat(100), i }, children: [] })) };
  const { body } = issueFromSnapshot(big);
  assert.ok(body.length <= 65536, String(body.length));
  assert.match(body, /too large to include in full/);
  assert.match(body, /### Reproduction/);
});

test("a pre-filled new-issue link carries the report, and fits in a link however large the snapshot", async () => {
  const { newIssueUrl } = await import("astralis-cli/github");
  const url = new URL(newIssueUrl(SNAPSHOT));
  assert.equal(url.origin + url.pathname, "https://github.com/sekiro-9/astralis-ui/issues/new");
  assert.equal(url.searchParams.get("title"), "Card loses its border");
  assert.match(url.searchParams.get("body"), /^### What happened\n\nNo border in dark mode/);
  assert.match(url.searchParams.get("body"), /Match keys: afp[0-9a-f]{12} acmpcard<\/sub>$/);

  const big = { ...SNAPSHOT, tree: Array.from({ length: 200 }, (_, i) => ({ component: "Text", props: { i }, children: [] })) };
  const cut = newIssueUrl(big);
  assert.ok(cut.length <= 8000, String(cut.length));
  const body = new URL(cut).searchParams.get("body");
  assert.match(body, /^### What happened/, "the words come first");
  assert.match(body, /does not fit in a link/);
  assert.match(body, /Match keys: /, "the keys survive, so a later report can still find it");
});
