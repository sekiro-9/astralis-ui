/* ==========================================================================
   astralis validate — check TSX against the installed design system.
   --------------------------------------------------------------------------
   Loads dist/system-spec.json from the installed astralis-ui (or --spec) and
   runs the validator core over every .tsx/.jsx under the given paths. Exits
   1 when anything that typechecks-but-fails is found.
   ========================================================================== */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { bold, cyan, dim, red, yellow, green, ok, fail } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { prepareSpec, validateSource } from "../lib/validate-core.mjs";
import { findInstalledSpec } from "../lib/spec-resolve.mjs";

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out", ".astralis"]);

function collectFiles(path, into) {
  const stats = statSync(path, { throwIfNoEntry: false });
  if (!stats) fail(`No such path: ${path}`);
  if (stats.isFile()) {
    if (/\.(tsx|jsx)$/.test(path)) into.push(path);
    return into;
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectFiles(join(path, entry.name), into);
    } else if (/\.(tsx|jsx)$/.test(entry.name)) {
      into.push(join(path, entry.name));
    }
  }
  return into;
}

function loadSpec(explicitPath) {
  const path = explicitPath ? resolve(explicitPath) : findInstalledSpec(process.cwd());
  if (!path) {
    fail(`Could not find astralis-ui's system spec here — is astralis-ui installed? (or pass ${cyan("--spec <path>")})`);
  }
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    fail(`Can't read the spec at ${path} (${error.code ?? error.message}).`);
  }
  let spec;
  try {
    spec = JSON.parse(text);
  } catch {
    fail(`${path} isn't valid JSON — expected astralis-ui's dist/system-spec.json.`);
  }
  if (!spec?.components || !Array.isArray(spec.classes)) {
    fail(`${path} isn't an astralis-ui system spec (it has no components or classes).`);
  }
  return spec;
}

export async function run(argv) {
  const args = parseCommandArgs(commandNamed("validate"), argv);
  if (!args) return;
  const paths = args.positionals.length > 0 ? args.positionals : ["."];
  const strictTokens = args.values["strict-tokens"];

  const spec = loadSpec(args.values.spec);
  const prepared = prepareSpec(spec);
  const files = paths.reduce((acc, p) => collectFiles(resolve(p), acc), []);
  if (files.length === 0) fail("No .tsx/.jsx files found under the given paths.");

  const results = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const file of files) {
    const rel = relative(process.cwd(), file) || file;
    const { errors, warnings } = validateSource(readFileSync(file, "utf8"), prepared, rel, { strictTokens });
    errorCount += errors.length;
    warningCount += warnings.length;
    if (errors.length || warnings.length) results.push({ file: rel, errors, warnings });
  }

  if (args.values.json) {
    console.log(JSON.stringify({
      spec: { name: spec.name, version: spec.version, specVersion: spec.specVersion },
      files: files.length,
      errors: errorCount,
      warnings: warningCount,
      results,
    }, null, 2));
    if (errorCount) process.exitCode = 1;
    return;
  }

  for (const r of results) {
    console.log(`\n${bold(r.file)}`);
    const all = [...r.errors.map((e) => ({ ...e, kind: "error" })), ...r.warnings.map((w) => ({ ...w, kind: "warn" }))]
      .sort((a, b) => a.line - b.line || a.column - b.column);
    for (const issue of all) {
      const mark = issue.kind === "error" ? red("✗") : yellow("!");
      console.log(`  ${dim(`${issue.line}:${issue.column}`)}  ${mark} ${issue.message}  ${dim(issue.code)}`);
    }
  }

  const summary = `${files.length} file(s) against ${spec.name}@${spec.version}` +
    ` — ${errorCount ? red(`${errorCount} error(s)`) : green("0 errors")}, ` +
    (warningCount ? yellow(`${warningCount} warning(s)`) : "0 warnings");
  console.log("");
  if (errorCount) {
    console.error(`${red("✗")} ${summary}`);
    process.exitCode = 1;
  } else {
    ok(summary);
  }
}
