import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ENTRY = fileURLToPath(new URL("../index.mjs", import.meta.url));
const run = (...args) => spawnSync(process.execPath, [ENTRY, ...args], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });

test("create-astralis runs `astralis create` with every argument passed through", () => {
  const help = run("--help");
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /Usage\s+astralis create <name>/);

  const bad = run("--framework");
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /--framework needs a value/);
});
