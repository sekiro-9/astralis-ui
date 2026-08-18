/* ==========================================================================
   astralis validate — check TSX against the installed design system.
   --------------------------------------------------------------------------
   Loads dist/system-spec.json from the installed astralis-ui (or --spec) and
   runs the validator core over every .tsx/.jsx under the given paths. Exits
   non-zero when anything that typechecks-but-fails is found: unknown
   components or parts, off-set keyword values, dead astralis:* classes,
   undeclared token variables, illegal breakpoint/state keys.

     astralis validate                    # the whole project
     astralis validate src/components    # a subtree or single files
     astralis validate --json            # machine-readable, for tooling/CI
   ========================================================================== */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { bold, cyan, dim, red, yellow, green, ok, fail } from "../lib/ui.mjs";
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
  if (explicitPath) {
    return JSON.parse(readFileSync(resolve(explicitPath), "utf8"));
  }
  const found = findInstalledSpec(process.cwd());
  if (!found) {
    fail(`Could not find astralis-ui's system spec here — is astralis-ui installed? (or pass ${cyan("--spec <path>")})`);
  }
  return JSON.parse(readFileSync(found, "utf8"));
}

export async function run(args) {
  const paths = [];
  let specPath = null;
  let asJson = false;
  let strictTokens = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--spec") specPath = args[++i];
    else if (arg === "--json") asJson = true;
    else if (arg === "--strict-tokens") strictTokens = true;
    else if (arg.startsWith("--")) fail(`Unknown option "${arg}"`);
    else paths.push(arg);
  }
  if (paths.length === 0) paths.push(".");

  const spec = loadSpec(specPath);
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

  if (asJson) {
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
