/* ==========================================================================
   astralis report: an issue snapshot from source files.
   --------------------------------------------------------------------------
   The same astralis-snapshot/1 the DevTools build from a page, built here
   from the JSX of the files that show the problem: the astralis-ui
   components with their literal props, the validator's findings for those
   files, and the versions installed. It prints the exact JSON and sends it
   to the Astralis issue platform only when the reporter confirms.
   ========================================================================== */

import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { bold, cyan, dim, fail, info, ok, ask, isAssumeYes, confirm, posix } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { loadSpec } from "../lib/spec-load.mjs";
import { detectFramework, readPackageJson } from "../lib/detect.mjs";
import { prepareSpec, validateSource } from "../lib/validate-core.mjs";
import { treeFromSource } from "../lib/report-tree.mjs";
import { SNAPSHOT_FORMAT, ISSUES_ORIGIN, LIMITS, checkSnapshot, submitDraft } from "../lib/snapshot.mjs";

/** The nearest node_modules/<name>/package.json above `root`: its version, or null. */
function installedVersion(root, name) {
  for (let dir = resolve(root); ; dir = dirname(dir)) {
    const file = join(dir, "node_modules", name, "package.json");
    if (statSync(file, { throwIfNoEntry: false })) {
      try {
        return JSON.parse(readFileSync(file, "utf8")).version ?? null;
      } catch {
        return null;
      }
    }
    if (dirname(dir) === dir) return null;
  }
}

function environmentOf(cwd) {
  const framework = detectFramework(readPackageJson(cwd));
  return {
    framework: { name: framework, version: framework ? installedVersion(cwd, framework) : null },
    react: installedVersion(cwd, "react"),
    browser: null,
    viewport: null,
    colorMode: null,
  };
}

/** The reporter's words: flags first, then prompts, with --yes taking what the flags gave. */
function describe(values) {
  const answer = (flag, question) => {
    if (values[flag] !== undefined) return values[flag];
    if (isAssumeYes()) return undefined;
    return ask(question) || undefined;
  };
  const title = answer("title", `${bold("Title")} ${dim("(one line)")}: `);
  if (!title?.trim()) {
    fail(`A report needs a title — pass ${cyan('--title "…"')}${isAssumeYes() ? " with --yes" : ""}.`);
  }
  const description = { title: title.trim().slice(0, LIMITS.title) };
  const happened = answer("happened", `${bold("What happened?")} ${dim("(Enter to skip)")} `);
  const expected = answer("expected", `${bold("What did you expect?")} ${dim("(Enter to skip)")} `);
  if (happened?.trim()) description.happened = happened.trim().slice(0, LIMITS.body);
  if (expected?.trim()) description.expected = expected.trim().slice(0, LIMITS.body);
  return description;
}

export async function run(argv) {
  const args = parseCommandArgs(commandNamed("report"), argv);
  if (!args) return;
  const { values, positionals } = args;
  const cwd = process.cwd();
  if (positionals.length === 0) {
    fail(`Name the files that show the problem: ${cyan("astralis report app/page.tsx")}.`);
  }

  const { spec, text: specText } = loadSpec(values.spec, cwd);
  const prepared = prepareSpec(spec);
  const tree = [];
  const findings = [];
  for (const given of positionals) {
    const file = resolve(given);
    if (!/\.(tsx|jsx)$/.test(file) || !statSync(file, { throwIfNoEntry: false })?.isFile()) {
      fail(`${given} is not a .tsx or .jsx file.`);
    }
    const rel = posix(relative(cwd, file));
    if (rel.startsWith("..")) fail(`${given} is outside this project; run the command from the project root.`);
    const source = readFileSync(file, "utf8");
    try {
      tree.push(...treeFromSource(source, spec, { includeText: values["include-text"] }));
    } catch (error) {
      fail(`${rel} does not parse: ${error.message}`);
    }
    const { errors, warnings } = validateSource(source, prepared, rel);
    findings.push(...errors, ...warnings);
  }
  if (tree.length === 0) fail("None of those files renders an astralis-ui component, so there is nothing to report.");

  const snapshot = {
    format: SNAPSHOT_FORMAT,
    source: "cli",
    library: {
      name: "astralis-ui",
      version: spec.version,
      specVersion: spec.specVersion,
      specSha256: createHash("sha256").update(specText).digest("hex"),
    },
    environment: environmentOf(cwd),
    route: null,
    tree,
    ...(values["no-findings"] ? {} : { findings: findings.slice(0, LIMITS.findings) }),
    description: describe(values),
  };
  const problems = checkSnapshot(snapshot);
  if (problems.length) fail(`The snapshot is not valid: ${problems.join("; ")}`);

  // The exact content, before anything leaves the machine.
  const json = JSON.stringify(snapshot, null, 2);
  console.log(json);

  if (values.out) {
    writeFileSync(resolve(values.out), `${json}\n`);
    ok(`snapshot written to ${values.out} ${dim("(nothing was sent)")}`);
    return;
  }
  if (values["dry-run"]) {
    info("dry run: nothing was sent.");
    return;
  }
  const send = await confirm("Send this snapshot to the Astralis issue platform?", {
    hint: `Pass --yes to send, or ${cyan("--out snapshot.json")} to save it instead.`,
  });
  if (!send) {
    info("nothing was sent.");
    return;
  }
  const origin = process.env.ASTRALIS_ISSUES_URL || ISSUES_ORIGIN;
  let url;
  try {
    url = await submitDraft(snapshot, { origin });
  } catch (error) {
    fail(`${error.message} Nothing was sent. ${cyan("--out snapshot.json")} saves the snapshot to attach by hand.`);
  }
  ok(`draft created: ${cyan(url)}`);
  console.log(dim("  Open it to sign in with GitHub, check it and submit the issue."));
}
