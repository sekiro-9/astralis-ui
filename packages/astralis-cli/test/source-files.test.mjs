import { test } from "node:test";
import assert from "node:assert/strict";
import { join, relative } from "node:path";
import { collectSourceFiles } from "astralis-cli/validate";
import { tempProject } from "./helpers.mjs";

test("collects .tsx and .jsx files and skips dependency and build folders", () => {
  const { dir, cleanup } = tempProject({
    "app/page.tsx": "",
    "app/legacy.jsx": "",
    "app/util.ts": "",
    "components/card.tsx": "",
    "node_modules/pkg/index.tsx": "",
    ".next/server/page.tsx": "",
    "dist/out.jsx": "",
  });
  try {
    const files = collectSourceFiles(dir).map((file) => relative(dir, file).replace(/\\/g, "/")).sort();
    assert.deepEqual(files, ["app/legacy.jsx", "app/page.tsx", "components/card.tsx"]);
  } finally {
    cleanup();
  }
});

test("accepts a single file, appends to a given list, and returns null for a missing path", () => {
  const { dir, cleanup } = tempProject({ "a.tsx": "", "b.ts": "" });
  try {
    const into = ["already"];
    assert.equal(collectSourceFiles(join(dir, "a.tsx"), into), into);
    assert.deepEqual(into, ["already", join(dir, "a.tsx")]);
    assert.deepEqual(collectSourceFiles(join(dir, "b.ts")), []);
    assert.equal(collectSourceFiles(join(dir, "missing")), null);
  } finally {
    cleanup();
  }
});
