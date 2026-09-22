import { test } from "node:test";
import assert from "node:assert/strict";
import { projectInfo, routeFiles, specHash } from "../src/bridge/project.mjs";
import { fixtureProject, SPEC, SPEC_TEXT } from "./helpers.mjs";

const APP = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/about/page.tsx",
  "app/blog/layout.tsx",
  "app/blog/template.tsx",
  "app/blog/[slug]/page.tsx",
  "app/blog/new/page.tsx",
  "app/docs/[...path]/page.jsx",
  "app/shop/[[...filters]]/page.tsx",
  "app/(marketing)/pricing/page.tsx",
  "app/(marketing)/layout.tsx",
  "app/@modal/login/page.tsx",
  "components/header.tsx",
];

test("the home page is its page and the root layout", () => {
  assert.deepEqual(routeFiles(APP, "/"), ["app/page.tsx", "app/layout.tsx"]);
});

test("a static route takes its page and every layout and template above it, nearest first", () => {
  assert.deepEqual(routeFiles(APP, "/about"), ["app/about/page.tsx", "app/layout.tsx"]);
  assert.deepEqual(routeFiles(APP, "/blog/new"), ["app/blog/new/page.tsx", "app/blog/template.tsx", "app/blog/layout.tsx", "app/layout.tsx"]);
});

test("a dynamic segment matches one segment, and a static one wins over it", () => {
  assert.equal(routeFiles(APP, "/blog/hello-world")[0], "app/blog/[slug]/page.tsx");
  assert.equal(routeFiles(APP, "/blog/new")[0], "app/blog/new/page.tsx");
  assert.deepEqual(routeFiles(APP, "/blog/a/b"), []);
});

test("catch-all segments need one or more parts, optional ones any number", () => {
  assert.equal(routeFiles(APP, "/docs/a/b/c")[0], "app/docs/[...path]/page.jsx");
  assert.deepEqual(routeFiles(APP, "/docs"), []);
  assert.equal(routeFiles(APP, "/shop")[0], "app/shop/[[...filters]]/page.tsx");
  assert.equal(routeFiles(APP, "/shop/red/large")[0], "app/shop/[[...filters]]/page.tsx");
});

test("route groups and parallel slots add no URL segment, and a group's layout applies", () => {
  assert.deepEqual(routeFiles(APP, "/pricing"), ["app/(marketing)/pricing/page.tsx", "app/(marketing)/layout.tsx", "app/layout.tsx"]);
  assert.equal(routeFiles(APP, "/login")[0], "app/@modal/login/page.tsx");
});

test("the query string and hash are ignored, and encoded segments decoded", () => {
  assert.equal(routeFiles(APP, "/about?tab=1#top")[0], "app/about/page.tsx");
  assert.equal(routeFiles(["app/café/page.tsx"], "/caf%C3%A9")[0], "app/café/page.tsx");
});

test("src/app is found too, and a project with no app directory has no route files", () => {
  assert.deepEqual(routeFiles(["src/app/page.tsx", "src/app/layout.tsx"], "/"), ["src/app/page.tsx", "src/app/layout.tsx"]);
  assert.deepEqual(routeFiles(["src/App.tsx", "src/main.tsx"], "/"), []);
});

test("projectInfo reads the installed versions and hashes the spec", () => {
  const project = fixtureProject({}, { framework: "next" });
  try {
    const info = projectInfo(project.dir, "next", SPEC, SPEC_TEXT);
    assert.deepEqual(info.library, {
      name: "astralis-ui",
      version: SPEC.version,
      specVersion: SPEC.specVersion,
      specSha256: specHash(SPEC_TEXT),
    });
    assert.match(info.library.specSha256, /^[0-9a-f]{64}$/);
    assert.deepEqual(info.framework, { name: "next", version: "99.1.0" });
    assert.equal(info.react, "19.2.0");
  } finally {
    project.cleanup();
  }
});
