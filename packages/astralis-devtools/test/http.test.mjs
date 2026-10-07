import { test } from "node:test";
import assert from "node:assert/strict";
import { handle, isLocal } from "../src/bridge/http.mjs";
import { GitHubSession } from "../src/bridge/github.mjs";
import { GET, POST } from "../src/next/route.mjs";
import { specHash } from "../src/bridge/project.mjs";
import { fixtureProject, INVALID_PAGE, manualWatch, SPEC_TEXT, until, VALID_PAGE } from "./helpers.mjs";

const request = (path, { host = "localhost:3000", origin = null, method = "GET", signal } = {}) => {
  const headers = { host };
  if (origin) headers.origin = origin;
  return new Request(`http://${host}/api/astralis-devtools/${path}`, { method, headers, signal });
};

/** A project and handle() options bound to it, each test its own root. */
function project(files = { "app/page.tsx": VALID_PAGE, "app/bad/page.tsx": INVALID_PAGE, "app/layout.tsx": VALID_PAGE }) {
  const fixture = fixtureProject(files);
  return { ...fixture, options: { root: fixture.dir, framework: "next", watch: manualWatch() } };
}

test("isLocal accepts loopback hosts and loopback pages only", () => {
  const local = (host, origin) => isLocal(new Request(`http://${host}/x`, { headers: { host, ...(origin ? { origin } : {}) } }));
  assert.equal(local("localhost:3000"), true);
  assert.equal(local("127.0.0.1:5173"), true);
  assert.equal(local("[::1]:3000"), true);
  assert.equal(local("localhost:3000", "http://localhost:3000"), true);
  assert.equal(local("192.168.1.20:3000"), false, "a dev server opened to the network");
  assert.equal(local("example.com"), false);
  assert.equal(local("localhost:3000", "https://evil.example"), false, "a page on another site");
  assert.equal(local("localhost:3000", "null"), false);
});

test("refuses other machines and other sites", async () => {
  const p = project();
  try {
    assert.equal((await handle(request("findings", { host: "192.168.1.20:3000" }), p.options)).status, 403);
    assert.equal((await handle(request("findings", { origin: "https://evil.example" }), p.options)).status, 403);
    assert.equal((await handle(request("findings", { method: "PUT" }), p.options)).status, 405);
    assert.equal((await handle(request("findings", { method: "POST" }), p.options)).status, 404, "POST is for snapshots, submitting and signing in only");
  } finally {
    p.cleanup();
  }
});

test("answers nothing in production", async () => {
  const p = project();
  const before = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    assert.equal((await handle(request("findings"), p.options)).status, 404);
    assert.equal((await GET(request("findings"))).status, 404);
  } finally {
    process.env.NODE_ENV = before;
    p.cleanup();
  }
});

test("info, spec, findings and route-files", async () => {
  const p = project();
  try {
    const info = await (await handle(request("info"), p.options)).json();
    assert.equal(info.library.specSha256, specHash(SPEC_TEXT));
    assert.equal(info.framework.name, "next");

    const spec = await handle(request("spec"), p.options);
    assert.equal(spec.headers.get("content-type"), "application/json; charset=utf-8");
    assert.equal(await spec.text(), SPEC_TEXT);

    const findings = await (await handle(request("findings"), p.options)).json();
    assert.equal(findings.errors, 1);
    assert.equal(findings.results[0].file, "app/bad/page.tsx");

    const route = await (await handle(request("route-files?path=%2Fbad"), p.options)).json();
    assert.deepEqual(route, { path: "/bad", files: ["app/bad/page.tsx", "app/layout.tsx"] });

    assert.equal((await handle(request("nope"), p.options)).status, 404);
  } finally {
    p.cleanup();
  }
});

test("the event stream opens with the current findings and closes when the page leaves", async () => {
  const p = project();
  const controller = new AbortController();
  try {
    const response = await handle(request("events", { signal: controller.signal }), p.options);
    assert.equal(response.headers.get("content-type"), "text/event-stream; charset=utf-8");
    const reader = response.body.getReader();
    const { value } = await reader.read();
    const text = new TextDecoder().decode(value);
    assert.match(text, /^event: findings\ndata: /);
    assert.equal(JSON.parse(text.split("data: ")[1]).errors, 1);

    controller.abort();
    const { done } = await reader.read();
    assert.equal(done, true);
  } finally {
    p.cleanup();
  }
});

test("the Next.js route handler serves the project it runs in", async () => {
  const p = project();
  const cwd = process.cwd();
  process.chdir(p.dir);
  try {
    const response = await GET(request("findings"));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).errors, 1);
  } finally {
    process.chdir(cwd);
    globalThis[Symbol.for("astralis-devtools.bridges")]?.forEach((bridge) => bridge.close());
    p.cleanup();
  }
});

/* ---- issue snapshots ------------------------------------------------------ */

const post = (path, body, { type = "application/json", host = "localhost:3000" } = {}) =>
  new Request(`http://${host}/api/astralis-devtools/${path}`, {
    method: "POST",
    headers: { host, "content-type": type },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const PAGE_PART = {
  tree: [{ component: "Card", props: { variant: "glass", href: "/secret", onClick: "x" }, children: [{ redacted: true, length: 5 }] }],
  route: "/bad?token=abc#x",
  environment: { browser: "Chrome 140", viewport: { width: 1280, height: 800 }, colorMode: "dark", extra: "dropped" },
  description: { title: "  Card loses its border  ", happened: "No border.", expected: "" },
  include: { findings: true, console: false },
  console: ["Error at C:\\Users\\me\\proj\\src\\x.tsx"],
};

test("POST snapshot completes the page's part with what only the dev server knows", async () => {
  const p = project();
  try {
    const { snapshot, problems } = await (await handle(post("snapshot", PAGE_PART), p.options)).json();
    assert.deepEqual(problems, []);
    assert.equal(snapshot.source, "devtools");
    assert.equal(snapshot.library.specSha256, specHash(SPEC_TEXT));
    assert.equal(snapshot.environment.framework.name, "next");
    assert.deepEqual(snapshot.environment.viewport, { width: 1280, height: 800 });
    assert.equal("extra" in snapshot.environment, false);
    assert.equal(snapshot.route, "/bad", "query string and fragment removed");
    assert.deepEqual(snapshot.tree[0].props, { variant: "glass" }, "the bridge narrows props itself");
    assert.equal(snapshot.tree[0].client, "none");
    assert.deepEqual(snapshot.findings.map((f) => f.file), ["app/bad/page.tsx"], "only the files that render the route");
    assert.equal("console" in snapshot, false, "console errors only when asked");
    assert.deepEqual(snapshot.description, { title: "Card loses its border", happened: "No border." });
  } finally {
    p.cleanup();
  }
});

test("POST snapshot includes console errors and a screenshot only when asked, and reports what is missing", async () => {
  const p = project();
  try {
    const shot = "data:image/jpeg;base64,AAAA";
    const withAll = await (await handle(post("snapshot", {
      ...PAGE_PART,
      include: { findings: false, console: true, screenshot: true },
      screenshot: shot,
    }), p.options)).json();
    assert.deepEqual(withAll.snapshot.console, ["Error at src/x.tsx"]);
    assert.equal(withAll.snapshot.screenshot, shot);
    assert.equal("findings" in withAll.snapshot, false);

    const untitled = await (await handle(post("snapshot", { ...PAGE_PART, description: {} }), p.options)).json();
    assert.ok(untitled.problems.some((m) => /title is required/.test(m)));
  } finally {
    p.cleanup();
  }
});

test("POST takes JSON only, within a size limit, and only on the snapshot routes", async () => {
  const p = project();
  try {
    assert.equal((await handle(post("snapshot", "{}", { type: "text/plain" }), p.options)).status, 415, "a form post from another site");
    assert.equal((await handle(post("snapshot", "{nope"), p.options)).status, 400);
    assert.equal((await handle(post("snapshot", JSON.stringify({ pad: "x".repeat(1024 * 1024) })), p.options)).status, 413);
    assert.equal((await handle(post("spec", {}), p.options)).status, 404);
    assert.equal((await handle(post("snapshot", {}, { host: "10.0.0.5:3000" }), p.options)).status, 403);
  } finally {
    p.cleanup();
  }
});

/* ---- GitHub ------------------------------------------------------------------ */

process.env.ASTRALIS_GITHUB_CLIENT_ID = "Iv1.test";

/** A sign-in kept in memory, standing in for the user's config file. */
const memoryStore = (saved = null) => ({ file: "memory", read: () => saved, write: (value) => (saved = { ...value, savedAt: "now" }), clear: () => (saved = null) });

/** A GitHub that answers by path, recording what it was sent. */
function fakeGitHub(routes) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const path = new URL(url).pathname;
    calls.push({ path, method: init.method ?? "GET", auth: init.headers?.authorization ?? null, body: init.body ?? null });
    const reply = typeof routes[path] === "function" ? routes[path](init) : routes[path];
    if (!reply) return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
    return new Response(JSON.stringify(reply.body ?? reply), { status: reply.status ?? 200 });
  };
  return { calls, fetchImpl };
}

test("GitHub status tells the page who is signed in, never the token", async () => {
  const p = project();
  const github = new GitHubSession({ store: memoryStore({ token: "tok-secret", login: "sam" }) });
  try {
    const response = await handle(request("github"), { ...p.options, github });
    const text = await response.text();
    assert.deepEqual(JSON.parse(text), { configured: true, repo: "sekiro-9/astralis-ui", login: "sam", pending: null, error: null });
    assert.doesNotMatch(text, /tok-secret/);
  } finally {
    p.cleanup();
  }
});

test("signing in shows a code, the bridge polls GitHub, and the sign-in is saved", async () => {
  const p = project();
  let polls = 0;
  const { fetchImpl } = fakeGitHub({
    "/login/device/code": { device_code: "dev", user_code: "WDJB-MJHT", verification_uri: "https://github.com/login/device", expires_in: 900, interval: 0 },
    "/login/oauth/access_token": () => (polls++ === 0 ? { error: "authorization_pending" } : { access_token: "tok-new" }),
    "/user": { login: "sam" },
  });
  const store = memoryStore();
  const github = new GitHubSession({ store, fetchImpl, sleep: async () => {} });
  try {
    const started = await (await handle(post("github/sign-in", {}), { ...p.options, github })).json();
    assert.equal(started.login, null);
    assert.equal(started.pending.userCode, "WDJB-MJHT");
    assert.equal("deviceCode" in started.pending, false, "the device code stays in the bridge");
    await until(() => store.read() !== null);
    assert.deepEqual((await (await handle(request("github"), { ...p.options, github })).json()).login, "sam");
    assert.equal(store.read().token, "tok-new");

    const out = await (await handle(post("github/sign-out", {}), { ...p.options, github })).json();
    assert.equal(out.login, null);
    assert.equal(store.read(), null);
  } finally {
    p.cleanup();
  }
});

test("a declined sign-in is reported once it ends", async () => {
  const p = project();
  const { fetchImpl } = fakeGitHub({
    "/login/device/code": { device_code: "dev", user_code: "C-1", verification_uri: "https://github.com/login/device", expires_in: 900, interval: 0 },
    "/login/oauth/access_token": { error: "access_denied" },
  });
  const github = new GitHubSession({ store: memoryStore(), fetchImpl, sleep: async () => {} });
  try {
    await handle(post("github/sign-in", {}), { ...p.options, github });
    await until(() => github.status().error !== null);
    const status = await (await handle(request("github"), { ...p.options, github })).json();
    assert.match(status.error, /declined/);
    assert.equal(status.pending, null);
  } finally {
    p.cleanup();
  }
});

test("POST submit opens the confirmed snapshot as an issue from the reporter's account", async () => {
  const p = project();
  const { calls, fetchImpl } = fakeGitHub({
    "/repos/sekiro-9/astralis-ui/issues": { status: 201, body: { number: 12, html_url: "https://github.com/sekiro-9/astralis-ui/issues/12" } },
  });
  const github = new GitHubSession({ store: memoryStore({ token: "tok", login: "sam" }), fetchImpl });
  try {
    const { snapshot } = await (await handle(post("snapshot", PAGE_PART), p.options)).json();
    const response = await handle(post("submit", snapshot), { ...p.options, github });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { number: 12, url: "https://github.com/sekiro-9/astralis-ui/issues/12" });
    const sent = JSON.parse(calls[0].body);
    assert.equal(calls[0].auth, "Bearer tok");
    assert.equal(sent.title, snapshot.description.title);
    assert.match(sent.body, /### Reproduction/);

    const invalid = await handle(post("submit", { ...snapshot, extra: 1 }), { ...p.options, github });
    assert.equal(invalid.status, 400);
    assert.match((await invalid.json()).error, /not valid/);
  } finally {
    p.cleanup();
  }
});

test("POST submit asks for a sign-in first, and forgets a token GitHub revoked", async () => {
  const p = project();
  const { fetchImpl } = fakeGitHub({ "/repos/sekiro-9/astralis-ui/issues": { status: 401, body: { message: "Bad credentials" } } });
  try {
    const { snapshot } = await (await handle(post("snapshot", PAGE_PART), p.options)).json();
    const none = await handle(post("submit", snapshot), { ...p.options, github: new GitHubSession({ store: memoryStore(), fetchImpl }) });
    assert.equal(none.status, 401);
    assert.match((await none.json()).error, /Sign in with GitHub first/);

    const store = memoryStore({ token: "old", login: "sam" });
    const revoked = await handle(post("submit", snapshot), { ...p.options, github: new GitHubSession({ store, fetchImpl }) });
    assert.equal(revoked.status, 401);
    assert.equal(store.read(), null);
  } finally {
    p.cleanup();
  }
});

test("GET github/issues lists the reporter's issues", async () => {
  const p = project();
  const { calls, fetchImpl } = fakeGitHub({
    "/repos/sekiro-9/astralis-ui/issues": [{ number: 4, title: "Card", state: "open", html_url: "u4", comments: 1, labels: [], created_at: "a", updated_at: "b" }],
  });
  const github = new GitHubSession({ store: memoryStore({ token: "tok", login: "sam" }), fetchImpl });
  try {
    const { issues } = await (await handle(request("github/issues"), { ...p.options, github })).json();
    assert.deepEqual(issues.map((i) => [i.number, i.state]), [[4, "open"]]);
    assert.equal(calls[0].auth, "Bearer tok");
  } finally {
    p.cleanup();
  }
});

test("the Next.js route answers POST as well, and nothing in production", async () => {
  const p = project();
  const cwd = process.cwd();
  process.chdir(p.dir);
  const env = process.env.NODE_ENV;
  try {
    const response = await POST(post("snapshot", PAGE_PART));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).snapshot.format, "astralis-snapshot/1");
    process.env.NODE_ENV = "production";
    assert.equal((await POST(post("snapshot", PAGE_PART))).status, 404);
  } finally {
    process.env.NODE_ENV = env;
    process.chdir(cwd);
    globalThis[Symbol.for("astralis-devtools.bridges")]?.forEach((bridge) => bridge.close());
    p.cleanup();
  }
});
