import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { COMMANDS } from "../src/lib/commands.mjs";
import { tempProject, runCli, serve } from "./helpers.mjs";

/* Dispatch and the failure contract: a user never sees a stack trace unless they ask for one. */

const STACK = /^\s+at .+:\d+:\d+\)?$/m;
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

test("bare astralis and --help list every command and --version", async () => {
  for (const args of [[], ["--help"], ["-h"], ["help"]]) {
    const { code, stdout } = await runCli(args);
    assert.equal(code, 0);
    for (const command of COMMANDS) assert.ok(stdout.includes(command.name), `${args} lists ${command.name}`);
    assert.match(stdout, /-v, --version/);
  }
});

test("--version prints the package version", async () => {
  const { code, stdout } = await runCli(["--version"]);
  assert.equal(code, 0);
  assert.equal(stdout.trim(), pkg.version);
});

/* CLI-F8: init --help printed a Node stack trace; validate --help said "Unknown option". */
test("every command answers --help and -h with its options, exit 0", async () => {
  for (const command of COMMANDS) {
    for (const flag of ["--help", "-h"]) {
      const { code, stdout, stderr } = await runCli([command.name, flag]);
      assert.equal(code, 0, `${command.name} ${flag}: ${stderr}`);
      assert.match(stdout, new RegExp(`Usage\\s+astralis ${command.name}`));
      for (const option of command.options) assert.ok(stdout.includes(`--${option.name}`));
    }
  }
});

test("an unknown option is a one-line error with a suggestion, not a stack", async () => {
  const { code, stderr } = await runCli(["init", "--dryrun"]);
  assert.equal(code, 1);
  assert.match(stderr, /Unknown option --dryrun for astralis init\. Did you mean --dry-run\?/);
  assert.doesNotMatch(stderr, STACK);
});

test("an unknown command suggests the nearest one", async () => {
  const { code, stderr } = await runCli(["valdate"]);
  assert.equal(code, 1);
  assert.match(stderr, /Did you mean "validate"\?/);
});

test("an unexpected failure is one line, and --debug adds the stack", async () => {
  // A catalogue with no `blocks` array is a bug-shaped failure, not a handled one.
  const registry = await serve({ "/r/index.json": {} });
  try {
    const args = ["add", "--list", "--registry", `${registry.url}/r`];
    const plain = await runCli(args);
    assert.equal(plain.code, 1);
    assert.match(plain.stderr, /Unexpected error: .+\n.*--debug/);
    assert.doesNotMatch(plain.stderr, STACK);

    const debug = await runCli([...args, "--debug"]);
    assert.equal(debug.code, 1);
    assert.match(debug.stderr, STACK);
  } finally {
    await registry.close();
  }
});

/* CLI-F20 */
test("validate with a missing or malformed --spec explains instead of throwing", async () => {
  const project = tempProject({ "a.tsx": "export const A = () => <div />;\n", "bad.json": "{nope" });
  try {
    const missing = await runCli(["validate", "--spec", "missing.json"], { cwd: project.dir });
    assert.equal(missing.code, 1);
    assert.match(missing.stderr, /Can't read the spec at .*missing\.json \(ENOENT\)/);
    assert.doesNotMatch(missing.stderr, STACK);

    const malformed = await runCli(["validate", "--spec", "bad.json"], { cwd: project.dir });
    assert.equal(malformed.code, 1);
    assert.match(malformed.stderr, /isn't valid JSON/);
  } finally {
    project.cleanup();
  }
});

/* CLI-F15: in CI a prompt read EOF and silently cancelled. */
test("a prompt with no input to read stops with a way forward", async () => {
  const project = tempProject();
  try {
    const { code, stderr } = await runCli(["connect-mcp"], { cwd: project.dir });
    assert.equal(code, 1);
    assert.match(stderr, /no input to read\. Pass --client <name>\./);
  } finally {
    project.cleanup();
  }
});

test("piped answers still reach prompts, one line each", async () => {
  const project = tempProject();
  try {
    // "9" is not on the menu: the prompt read it and declined, rather than hitting EOF.
    const { code, stdout } = await runCli(["connect-mcp"], { cwd: project.dir, input: "9\n" });
    assert.equal(code, 0);
    assert.match(stdout, /No client selected/);
  } finally {
    project.cleanup();
  }
});
