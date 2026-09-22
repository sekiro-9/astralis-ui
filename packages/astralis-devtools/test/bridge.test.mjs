import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { Bridge, bridgeFor } from "../src/bridge/bridge.mjs";
import { fixtureProject, INVALID_PAGE, manualWatch, until, VALID_PAGE } from "./helpers.mjs";

function started(files, options = {}) {
  const project = fixtureProject(files, options);
  const watch = manualWatch();
  const bridge = new Bridge({ root: project.dir, framework: options.framework ?? "next", watch });
  return { project, watch, bridge, done: () => (bridge.close(), project.cleanup()) };
}

test("validates every source file on start and reports only the files with findings", async () => {
  const { bridge, watch, done } = started({
    "app/page.tsx": VALID_PAGE,
    "app/broken/page.tsx": INVALID_PAGE,
    "app/util.ts": "export const x = 1;",
    "node_modules/pkg/index.tsx": INVALID_PAGE,
    ".next/server/page.tsx": INVALID_PAGE,
  });
  try {
    await bridge.start();
    const findings = bridge.findings();
    assert.equal(findings.files, 2, "two .tsx files outside dependency and build folders");
    assert.equal(findings.errors, 1);
    assert.equal(findings.warnings, 0);
    assert.deepEqual(
      findings.results.map((r) => [r.file, r.errors.map((e) => `${e.code}@${e.line}:${e.column}`)]),
      [["app/broken/page.tsx", ["invalid-recipe-value@3:16"]]],
    );
    assert.ok(watch.active(), "watching after the first pass");
    assert.equal(bridge.start(), bridge.start(), "one load, however many callers");
  } finally {
    done();
  }
});

test("a saved change is re-validated and every listener hears about it", async () => {
  const { bridge, watch, project, done } = started({ "app/page.tsx": VALID_PAGE });
  try {
    await bridge.start();
    const heard = [];
    const unlisten = bridge.listen((findings) => heard.push(findings));

    project.write("app/page.tsx", INVALID_PAGE);
    watch.emit(join(project.dir, "app/page.tsx"));
    await until(() => heard.length === 1);
    assert.equal(heard[0].errors, 1);
    assert.equal(heard[0].results[0].file, "app/page.tsx");
    assert.ok(heard[0].version > 1);

    project.write("app/page.tsx", VALID_PAGE);
    watch.emit(join(project.dir, "app/page.tsx"));
    await until(() => heard.length === 2);
    assert.equal(heard[1].errors, 0);

    unlisten();
    project.write("app/page.tsx", INVALID_PAGE);
    watch.emit(join(project.dir, "app/page.tsx"));
    await new Promise((done) => setTimeout(done, 150));
    assert.equal(heard.length, 2, "an unsubscribed listener hears nothing more");
  } finally {
    done();
  }
});

test("bursts of events for one file are validated once", async () => {
  const { bridge, watch, project, done } = started({ "app/page.tsx": VALID_PAGE });
  try {
    await bridge.start();
    let calls = 0;
    bridge.listen(() => calls++);
    project.write("app/page.tsx", INVALID_PAGE);
    for (let i = 0; i < 5; i++) watch.emit(join(project.dir, "app/page.tsx"));
    await until(() => calls === 1);
    await new Promise((done) => setTimeout(done, 150));
    assert.equal(calls, 1);
  } finally {
    done();
  }
});

test("new files are added, deleted files dropped, and untracked paths ignored", async () => {
  const { bridge, watch, project, done } = started({ "app/page.tsx": VALID_PAGE });
  try {
    await bridge.start();
    let calls = 0;
    bridge.listen(() => calls++);

    project.write("components/bad.tsx", INVALID_PAGE);
    watch.emit(join(project.dir, "components/bad.tsx"));
    await until(() => calls === 1);
    assert.equal(bridge.findings().files, 2);
    assert.equal(bridge.findings().errors, 1);

    project.remove("components/bad.tsx");
    watch.emit(join(project.dir, "components/bad.tsx"));
    await until(() => calls === 2);
    assert.equal(bridge.findings().files, 1);
    assert.equal(bridge.findings().errors, 0);

    for (const path of ["node_modules/x/a.tsx", "dist/a.tsx", "app/style.css", "../outside.tsx"]) {
      watch.emit(join(project.dir, path));
    }
    await new Promise((done) => setTimeout(done, 150));
    assert.equal(calls, 2, "nothing outside the tracked source changed the findings");
  } finally {
    done();
  }
});

test("says so when astralis-ui is not installed, instead of failing", async () => {
  const { bridge, watch, done } = started({ "app/page.tsx": VALID_PAGE }, { installed: false });
  try {
    await bridge.start();
    assert.match(bridge.findings().problem, /astralis-ui is not installed/);
    assert.equal(watch.active(), false);
  } finally {
    done();
  }
});

test("route files come from the tracked files, for Next.js only", async () => {
  const next = started({ "app/layout.tsx": VALID_PAGE, "app/about/page.tsx": VALID_PAGE });
  const vite = started({ "src/App.tsx": VALID_PAGE }, { framework: "vite" });
  try {
    await Promise.all([next.bridge.start(), vite.bridge.start()]);
    assert.deepEqual(next.bridge.routeFiles("/about"), ["app/about/page.tsx", "app/layout.tsx"]);
    assert.deepEqual(vite.bridge.routeFiles("/"), []);
  } finally {
    next.done();
    vite.done();
  }
});

test("the real file watcher picks up a save", async () => {
  const project = fixtureProject({ "app/page.tsx": VALID_PAGE });
  const bridge = new Bridge({ root: project.dir, framework: "next" });
  try {
    await bridge.start();
    let latest = null;
    bridge.listen((findings) => (latest = findings));
    project.write("app/page.tsx", INVALID_PAGE);
    await until(() => latest?.errors === 1, 5000);
  } finally {
    bridge.close();
    project.cleanup();
  }
});

test("bridgeFor keeps one bridge per project and framework across module reloads", () => {
  const project = fixtureProject({});
  try {
    const a = bridgeFor(project.dir, "next", { watch: manualWatch() });
    assert.equal(bridgeFor(project.dir, "next"), a);
    assert.notEqual(bridgeFor(project.dir, "vite"), a);
  } finally {
    project.cleanup();
  }
});
