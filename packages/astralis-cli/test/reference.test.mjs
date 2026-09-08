import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { README, DOCS_PAGE, syncReadme, syncDocsPage } from "../scripts/reference.mjs";
import { COMMANDS } from "../src/lib/commands.mjs";

/* CLI-F9: the README and docs had drifted from the code (validate missing, wrong defaults, flags undocumented). */

const STALE = "is stale: run `node scripts/reference.mjs` in packages/astralis-cli";

test("the README's command reference matches the command table", () => {
  const text = readFileSync(README, "utf8");
  assert.equal(syncReadme(text), text, `README.md ${STALE}`);
  for (const command of COMMANDS) assert.ok(text.includes(`### \`astralis ${command.name}`), command.name);
});

test("the docs CLI page's option tables match the command table", { skip: !existsSync(DOCS_PAGE) }, () => {
  const text = readFileSync(DOCS_PAGE, "utf8");
  assert.equal(syncDocsPage(text), text, `the docs CLI page ${STALE}`);
});
