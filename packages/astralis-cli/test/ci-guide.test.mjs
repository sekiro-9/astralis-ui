import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { workflowYaml } from "../src/lib/ci.mjs";

const GUIDE = fileURLToPath(new URL("../../astralis-docs/src/app/docs/validate-in-ci/page.mdx", import.meta.url));

test("the Validate in CI guide shows exactly the workflow init --ci writes for npm", () => {
  const guide = readFileSync(GUIDE, "utf8").replaceAll("\r\n", "\n");
  const shown = /```yaml\n([\s\S]*?)```/.exec(guide)?.[1];
  assert.ok(shown, "the guide has a yaml block");
  const written = workflowYaml(
    { pm: "npm", lockfile: "package-lock.json", subdir: "", pnpmVersion: null, pnpmPinned: false, yarnBerry: false },
    "validate",
  );
  assert.equal(shown, written);
});
