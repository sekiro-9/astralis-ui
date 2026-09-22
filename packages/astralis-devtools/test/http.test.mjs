import { test } from "node:test";
import assert from "node:assert/strict";
import { handle, isLocal } from "../src/bridge/http.mjs";
import { GET } from "../src/next/route.mjs";
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
    assert.equal((await handle(request("findings", { method: "POST" }), p.options)).status, 405);
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
