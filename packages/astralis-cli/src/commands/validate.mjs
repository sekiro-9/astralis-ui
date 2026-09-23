/* ==========================================================================
   astralis validate — check TSX against the installed design system.
   --------------------------------------------------------------------------
   Loads dist/system-spec.json from the installed astralis-ui (or --spec) and
   runs the validator core over every .tsx/.jsx under the given paths. Exits
   1 when anything that typechecks-but-fails is found.
   ========================================================================== */

import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { bold, dim, red, yellow, green, ok, fail } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { prepareSpec, validateSource } from "../lib/validate-core.mjs";
import { loadSpec } from "../lib/spec-load.mjs";
import { collectSourceFiles } from "../lib/source-files.mjs";
import { annotation } from "../lib/github-annotations.mjs";

const FORMATS = ["text", "json", "github"];

/** --format wins; --json means json; inside GitHub Actions the default is annotations. */
function chooseFormat(values, env = process.env) {
  if (values.format !== undefined && !FORMATS.includes(values.format)) {
    fail(`--format must be one of ${FORMATS.join(", ")} (got "${values.format}").`);
  }
  if (values.json && values.format !== undefined && values.format !== "json") {
    fail(`--json and --format ${values.format} disagree; pass one of them.`);
  }
  if (values.json) return "json";
  return values.format ?? (env.GITHUB_ACTIONS === "true" ? "github" : "text");
}

function collectFiles(path, into) {
  if (!collectSourceFiles(path, into)) fail(`No such path: ${path}`);
  return into;
}

export async function run(argv) {
  const args = parseCommandArgs(commandNamed("validate"), argv);
  if (!args) return;
  const paths = args.positionals.length > 0 ? args.positionals : ["."];
  const strictTokens = args.values["strict-tokens"];
  const format = chooseFormat(args.values);

  const { spec } = loadSpec(args.values.spec);
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

  if (format === "json") {
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

  if (format === "github") {
    for (const r of results) {
      for (const e of r.errors) console.log(annotation("error", e));
      for (const w of r.warnings) console.log(annotation("warning", w));
    }
  }

  for (const r of format === "text" ? results : []) {
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
