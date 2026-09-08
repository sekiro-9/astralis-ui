import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommandArgs, commandHelp } from "../src/lib/args.mjs";
import { COMMANDS, GLOBAL_OPTIONS, commandNamed } from "../src/lib/commands.mjs";
import { CliExit, isAssumeYes, setAssumeYes } from "../src/lib/ui.mjs";
import { suggest } from "../src/lib/suggest.mjs";

/** fail() prints and sets the exit code; keep this test process's code clean. */
function parseFails(command, argv) {
  const error = console.error;
  console.error = () => {};
  try {
    assert.throws(() => parseCommandArgs(commandNamed(command), argv), CliExit);
  } finally {
    console.error = error;
    process.exitCode = 0;
  }
}

test("string options take the next argument or an inline =value", () => {
  const spaced = parseCommandArgs(commandNamed("theme"), ["--brand", "#8b5cf6", "--out", "a.css"]);
  const inline = parseCommandArgs(commandNamed("theme"), ["--brand=#8b5cf6", "--out=a.css"]);
  assert.equal(spaced.values.brand, "#8b5cf6");
  assert.deepEqual(inline.values, spaced.values);
});

test("a string value may start with a dash", () => {
  const { values } = parseCommandArgs(commandNamed("theme"), ["--font-body", "-apple-system, sans-serif"]);
  assert.equal(values["font-body"], "-apple-system, sans-serif");
});

test("booleans default to false and positionals are collected", () => {
  const { values, positionals } = parseCommandArgs(commandNamed("add"), ["hero-01", "--dry-run", "login-01"]);
  assert.equal(values["dry-run"], true);
  assert.equal(values.overwrite, false);
  assert.deepEqual(positionals, ["hero-01", "login-01"]);
});

test("unknown options, missing values and stray arguments are refused", () => {
  parseFails("init", ["--dryrun"]);
  parseFails("init", ["--yes=1"]);
  parseFails("theme", ["--out"]);
  parseFails("init", ["extra"]);
  parseFails("connect-mcp", ["-q"]);
});

/* CLI-F26: `--framework=vite` used to be forwarded to the scaffolder and ignored. */
test("create consumes its own options in either form and forwards the rest in order", () => {
  const { values, positionals, forwarded } = parseCommandArgs(commandNamed("create"), [
    "my-app",
    "--framework=vite",
    "--template",
    "react",
    "--no-starter",
    "-i",
  ]);
  assert.equal(values.framework, "vite");
  assert.equal(values["no-starter"], true);
  assert.deepEqual(positionals, ["my-app"]);
  assert.deepEqual(forwarded, ["--template", "react", "-i"]);
});

test("-y and --yes switch prompts off for the rest of the run", () => {
  try {
    parseCommandArgs(commandNamed("init"), ["-y"]);
    assert.equal(isAssumeYes(), true);
  } finally {
    setAssumeYes(false);
  }
});

test("every command accepts the global options, and its help lists all of them", () => {
  for (const command of COMMANDS) {
    const help = commandHelp(command);
    for (const option of [...command.options, ...GLOBAL_OPTIONS]) {
      assert.ok(help.includes(`--${option.name}`), `${command.name} --help misses --${option.name}`);
    }
  }
});

test("suggestions come from within two edits", () => {
  assert.equal(suggest("valdate", ["validate", "init"]), "validate");
  assert.equal(suggest("dryrun", ["dry-run", "list"]), "dry-run");
  assert.equal(suggest("zzzzzz", ["init"]), null);
});
