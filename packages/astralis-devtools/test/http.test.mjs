import { test } from "node:test";
import assert from "node:assert/strict";
import { handle, isLocal } from "../src/bridge/http.mjs";
import { GET, POST } from "../src/next/route.mjs";
import { createServer } from "node:http";
import { specHash } from "../src/bridge/project.mjs";
import { fixtureProject, INVALID_PAGE, manualWatch, SPEC_TEXT, VALID_PAGE } from "./helpers.mjs";

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
    assert.equal((await handle(request("findings", { method: "POST" }), p.options)).status, 404, "POST is for snapshot and submit only");
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

test("POST submit forwards the confirmed snapshot to the platform and returns the draft's address", async () => {
  const p = project();
  let received = null;
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      received = { path: req.url, body: JSON.parse(body) };
      res.writeHead(201, { "content-type": "application/json" });
      res.end(JSON.stringify({ id: "d1", url: "/issues/new?draft=d1" }));
    });
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const before = process.env.ASTRALIS_ISSUES_URL;
  process.env.ASTRALIS_ISSUES_URL = `http://127.0.0.1:${server.address().port}`;
  try {
    const { snapshot } = await (await handle(post("snapshot", PAGE_PART), p.options)).json();
    const response = await handle(post("submit", snapshot), p.options);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).url, `${process.env.ASTRALIS_ISSUES_URL}/issues/new?draft=d1`);
    assert.equal(received.path, "/api/issues/drafts");
    assert.deepEqual(received.body, snapshot, "exactly the snapshot the reporter saw");

    const invalid = await handle(post("submit", { ...snapshot, extra: 1 }), p.options);
    assert.equal(invalid.status, 502);
    assert.match((await invalid.json()).error, /not valid/);
  } finally {
    if (before === undefined) delete process.env.ASTRALIS_ISSUES_URL;
    else process.env.ASTRALIS_ISSUES_URL = before;
    server.close();
    p.cleanup();
  }
});

test("POST submit explains an unreachable platform", async () => {
  const p = project();
  const before = process.env.ASTRALIS_ISSUES_URL;
  process.env.ASTRALIS_ISSUES_URL = "http://127.0.0.1:9";
  try {
    const { snapshot } = await (await handle(post("snapshot", PAGE_PART), p.options)).json();
    const response = await handle(post("submit", snapshot), p.options);
    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /Could not reach the Astralis issue platform/);
  } finally {
    if (before === undefined) delete process.env.ASTRALIS_ISSUES_URL;
    else process.env.ASTRALIS_ISSUES_URL = before;
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
