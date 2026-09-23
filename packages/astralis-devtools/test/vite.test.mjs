import { test } from "node:test";
import assert from "node:assert/strict";
import { symlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build, createServer } from "vite";
import { astralisDevtools } from "../src/vite.mjs";
import { bridgeMiddleware } from "../src/bridge/node-adapter.mjs";
import { fixtureProject, INVALID_PAGE, manualWatch, VALID_PAGE } from "./helpers.mjs";

const PACKAGE_DIR = fileURLToPath(new URL("..", import.meta.url));

/** A Vite project with astralis-devtools linked in, as installing it would. */
function viteProject() {
  const project = fixtureProject(
    {
      "index.html": '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>',
      "src/main.jsx": 'document.getElementById("root").textContent = "app";\n',
      "src/App.tsx": VALID_PAGE,
    },
    { framework: "vite" },
  );
  symlinkSync(PACKAGE_DIR, join(project.dir, "node_modules", "astralis-devtools"), "junction");
  return project;
}

async function readEvent(reader) {
  let text = "";
  const decoder = new TextDecoder();
  while (!text.includes("\n\n")) {
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value);
  }
  return JSON.parse(text.split("data: ")[1].split("\n")[0]);
}

test("the plugin is for the dev server only", () => {
  const plugin = astralisDevtools();
  assert.equal(plugin.name, "astralis-devtools");
  assert.equal(plugin.apply, "serve");
});

test("in a real Vite dev server: overlay injected, bridge served, saves streamed", async () => {
  const project = viteProject();
  const server = await createServer({
    root: project.dir,
    configFile: false,
    logLevel: "silent",
    plugins: [astralisDevtools()],
    server: { port: 0, host: "127.0.0.1" },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const controller = new AbortController();
  try {
    // Follow what the browser does: the page loads the entry, the entry imports the overlay.
    const html = await (await fetch(`${origin}/`)).text();
    assert.match(html, /<script type="module" src="\/@astralis-devtools\/entry\.js"><\/script>/);
    const entry = await fetch(`${origin}/@astralis-devtools/entry.js`);
    assert.equal(entry.status, 200);
    assert.match(entry.headers.get("content-type"), /javascript/);
    const entrySource = await entry.text();
    assert.match(entrySource, /mountOverlay\(\{ base: "\/api\/astralis-devtools", framework: "vite" \}\)/);
    const imported = entrySource.match(/import \{ mountOverlay \} from "([^"]+)"/)?.[1];
    assert.ok(imported && imported.startsWith("/"), `the bare import was resolved to a served path (got ${imported})`);
    const overlay = await fetch(`${origin}${imported}`);
    assert.equal(overlay.status, 200);
    assert.match(await overlay.text(), /export function mountOverlay/);

    const findings = await (await fetch(`${origin}/api/astralis-devtools/findings`)).json();
    assert.equal(findings.files, 2, "src/main.jsx and src/App.tsx");
    assert.equal(findings.errors, 0);

    const events = await fetch(`${origin}/api/astralis-devtools/events`, { signal: controller.signal });
    assert.equal(events.headers.get("content-type"), "text/event-stream; charset=utf-8");
    const reader = events.body.getReader();
    assert.equal((await readEvent(reader)).errors, 0);

    // Vite's own watcher reports the save; the bridge does not open a second one.
    project.write("src/App.tsx", INVALID_PAGE);
    server.watcher.emit("change", join(project.dir, "src/App.tsx"));
    const updated = await readEvent(reader);
    assert.equal(updated.errors, 1);
    assert.equal(updated.results[0].file, "src/App.tsx");
  } finally {
    controller.abort();
    await server.close();
    globalThis[Symbol.for("astralis-devtools.bridges")]?.forEach((bridge) => bridge.close());
    project.cleanup();
  }
});

test("vite build leaves no trace of the DevTools", async () => {
  const project = viteProject();
  try {
    const output = await build({
      root: project.dir,
      configFile: false,
      logLevel: "silent",
      plugins: [astralisDevtools()],
      build: { write: false },
    });
    const files = (Array.isArray(output) ? output : [output]).flatMap((o) => o.output);
    const text = files.map((f) => (f.type === "chunk" ? f.code : String(f.source))).join("\n");
    assert.ok(files.some((f) => f.fileName === "index.html"));
    assert.doesNotMatch(text, /astralis-devtools|mountOverlay/);
  } finally {
    project.cleanup();
  }
});

test("the middleware refuses a socket from another machine, whatever its headers say", async () => {
  const middleware = bridgeMiddleware({ root: process.cwd(), framework: "vite", watch: manualWatch() });
  const res = { statusCode: 200, end() {}, on() {} };
  const req = { socket: { remoteAddress: "10.0.0.7" }, headers: { host: "localhost:5173" }, url: "/findings", method: "GET" };
  await middleware(req, res, (error) => assert.fail(error));
  assert.equal(res.statusCode, 403);
});

test("in a real Vite dev server: a POST reaches the bridge with its body", async () => {
  const project = viteProject();
  const server = await createServer({
    root: project.dir,
    configFile: false,
    logLevel: "silent",
    plugins: [astralisDevtools()],
    server: { port: 0, host: "127.0.0.1" },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  try {
    const response = await fetch(`${origin}/api/astralis-devtools/snapshot`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tree: [{ component: "Card", props: { variant: "outline" }, children: [] }],
        route: "/",
        description: { title: "From Vite" },
      }),
    });
    assert.equal(response.status, 200);
    const { snapshot, problems } = await response.json();
    assert.deepEqual(problems, []);
    assert.equal(snapshot.environment.framework.name, "vite");
    assert.equal(snapshot.description.title, "From Vite");
    assert.equal((await fetch(`${origin}/api/astralis-devtools/snapshot`, { method: "POST", body: "x" })).status, 415);
  } finally {
    await server.close();
    globalThis[Symbol.for("astralis-devtools.bridges")]?.forEach((bridge) => bridge.close());
    project.cleanup();
  }
});
