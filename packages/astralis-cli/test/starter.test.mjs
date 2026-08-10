import { test } from "node:test";
import assert from "node:assert/strict";
import { STARTER_IMPORTS, starterFile, starterTarget } from "../src/lib/starter.mjs";

/*
 * The welcome screen is TSX emitted as text, so nothing typechecks it — it is
 * the one Astralis artifact with no compiler behind it. That is exactly how
 * `Auth01` survived a rename: valid-looking code referring to an export that
 * no longer existed, caught only when a human read the output.
 *
 * These assert the starter against the library's real export list, so a
 * removed or renamed component fails the build instead of shipping a starter
 * that crashes on first `dev`.
 */

const ui = await import("astralis-ui");

test("every component the starter imports is a real astralis-ui export", () => {
  const missing = STARTER_IMPORTS.filter((name) => !(name in ui));
  assert.deepEqual(missing, [], `starter imports that no longer exist: ${missing.join(", ")}`);
});

test("the import list matches what the generated source actually imports", () => {
  const { source } = starterFile("vite", "/project/src/main.tsx");
  const block = source.match(/^import \{([\s\S]*?)\} from "astralis-ui";/m);
  assert.ok(block, "starter should import from astralis-ui");

  const imported = block[1]
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .sort();

  assert.deepEqual(imported, [...STARTER_IMPORTS].sort());
});

test("the starter only imports from astralis-ui", () => {
  const { source } = starterFile("next", "/project/src/app/layout.tsx");
  const specifiers = [...source.matchAll(/from "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(specifiers)], ["astralis-ui"]);
});

/*
 * Under Next the starter is written to app/page.tsx — a Server Component.
 * Namespace access on a client-reference stub is undefined across the RSC
 * boundary, so <Card.Body> would render nothing and blame no one. This is the
 * same rule the block authoring gate enforces, applied to the one file the CLI
 * writes itself.
 */
test("the starter uses flat exports, never compound access", () => {
  const { source } = starterFile("next", "/project/src/app/layout.tsx");
  const dotted = [...source.matchAll(/<([A-Z]\w*\.\w+)/g)].map((m) => m[1]);
  assert.deepEqual(dotted, [], `compound access breaks in Server Components: ${dotted.join(", ")}`);
});

test("the target file sits beside the entry and follows its extension", () => {
  assert.equal(starterTarget("vite", "/p/src/main.tsx").replace(/\\/g, "/"), "/p/src/App.tsx");
  assert.equal(starterTarget("vite", "/p/src/main.jsx").replace(/\\/g, "/"), "/p/src/App.jsx");
  assert.equal(
    starterTarget("next", "/p/src/app/layout.tsx").replace(/\\/g, "/"),
    "/p/src/app/page.tsx",
  );
  assert.equal(starterTarget("next", "/p/app/layout.jsx").replace(/\\/g, "/"), "/p/app/page.jsx");
});
