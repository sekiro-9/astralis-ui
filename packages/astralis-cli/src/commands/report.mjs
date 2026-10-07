/* ==========================================================================
   astralis report: an issue snapshot from source files.
   --------------------------------------------------------------------------
   The same astralis-snapshot/1 the DevTools build from a page, built here
   from the JSX of the files that show the problem: the astralis-ui
   components with their literal props, the validator's findings for those
   files, and the versions installed. It prints the exact JSON and opens it
   as a GitHub issue, from the reporter's own account, only when they
   confirm. The first time, they sign in with a code on github.com.
   ========================================================================== */

import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { bold, cyan, dim, fail, info, ok, warn, ask, isAssumeYes, confirm, select, posix } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { loadSpec } from "../lib/spec-load.mjs";
import { detectFramework, readPackageJson } from "../lib/detect.mjs";
import { prepareSpec, validateSource } from "../lib/validate-core.mjs";
import { treeFromSource } from "../lib/report-tree.mjs";
import { SNAPSHOT_FORMAT, LIMITS, checkSnapshot } from "../lib/snapshot.mjs";
import {
  commentFromSnapshot,
  commentOnIssue,
  createIssue,
  findSimilar,
  finishSignIn,
  issueFromSnapshot,
  issuesRepo,
  newIssueUrl,
  startSignIn,
  tokenStore,
} from "../lib/github.mjs";

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

/** Sign in with GitHub's device flow, in the terminal, and save the sign-in. */
async function signIn(store) {
  let flow;
  try {
    flow = await startSignIn();
  } catch (error) {
    fail(`${error.message} Nothing was sent. ${cyan("--out snapshot.json")} saves the snapshot to attach by hand.`);
  }
  console.log("");
  console.log(`  Sign in to GitHub: open ${cyan(flow.verificationUri)} and enter ${bold(flow.userCode)}`);
  console.log(dim(`  The Astralis DevTools app can only read and write issues on ${issuesRepo()}.`));
  console.log("");
  try {
    const signedIn = await finishSignIn(flow);
    store.write(signedIn);
    ok(`signed in as ${bold(signedIn.login)}`);
    return signedIn;
  } catch (error) {
    fail(`${error.message} Nothing was sent.`);
  }
}

export async function run(argv) {
  const args = parseCommandArgs(commandNamed("report"), argv);
  if (!args) return;
  const { values, positionals } = args;
  const cwd = process.cwd();
  if (values["sign-out"]) {
    const store = tokenStore();
    const saved = store.read();
    store.clear();
    if (saved) ok(`signed out of GitHub (${saved.login}). The app's access ends when you revoke it at github.com/settings/applications.`);
    else info("not signed in to GitHub.");
    return;
  }
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
  if (values.link) {
    // No sign-in: GitHub's own form, pre-filled, submitted in the browser.
    ok("open this link to check the report on GitHub and submit it yourself:");
    console.log(`  ${cyan(newIssueUrl(snapshot))}`);
    console.log(dim("  Nothing is sent until you press Create on GitHub."));
    return;
  }
  const send = await confirm(`Open this as an issue on github.com/${issuesRepo()}?`, {
    hint: `Pass --yes to send, or ${cyan("--out snapshot.json")} to save it instead.`,
  });
  if (!send) {
    info("nothing was sent.");
    return;
  }
  const store = tokenStore();
  let signedIn = store.read() ?? (await signIn(store));
  const keep = `Nothing was sent. ${cyan("--out snapshot.json")} saves the snapshot to attach by hand.`;
  /** Run `work` signed in; a sign-in GitHub revoked is replaced, once. */
  const asUser = async (work) => {
    try {
      return await work(signedIn.token);
    } catch (error) {
      if (error.code !== "signed-out") throw error;
      store.clear();
      signedIn = await signIn(store);
      return work(signedIn.token);
    }
  };

  const target = await chooseTarget(values, () => asUser((token) => findSimilar(token, snapshot)));
  try {
    if (target) {
      const added = await asUser((token) => commentOnIssue(token, target, commentFromSnapshot(snapshot)));
      ok(`report added to issue #${added.number} as ${signedIn.login}: ${cyan(added.url)}`);
    } else {
      const created = await asUser((token) => createIssue(token, issueFromSnapshot(snapshot)));
      ok(`issue #${created.number} opened as ${signedIn.login}: ${cyan(created.url)}`);
    }
  } catch (error) {
    fail(`${error.message} ${keep}`);
  }
}

const line = (issue) => `#${issue.number} ${issue.title} ${dim(`(${issue.state})`)}`;

/**
 * Where the report goes: an existing issue's number, or null for a new issue.
 * --add-to and --new decide without searching. Otherwise the issues that may
 * already report it are shown, and the reporter chooses; with --yes, a new
 * issue is opened and the possible duplicates are listed for them to check.
 */
async function chooseTarget(values, searchSimilar) {
  if (values["add-to"] !== undefined) {
    const number = Number(String(values["add-to"]).replace(/^#/, ""));
    if (!Number.isInteger(number) || number < 1) fail(`--add-to takes an issue number, like ${cyan("--add-to 12")}.`);
    return number;
  }
  if (values.new) return null;
  let similar;
  try {
    similar = await searchSimilar();
  } catch (error) {
    warn(`could not check for an existing issue (${error.message}); opening a new one.`);
    return null;
  }
  const { duplicates, related } = similar;
  if (related.length) {
    info(`open issues about the same component:`);
    for (const issue of related) console.log(`  ${line(issue)}  ${dim(issue.url)}`);
  }
  if (!duplicates.length) return null;
  console.log("");
  console.log(bold("This may already be reported:"));
  for (const issue of duplicates) console.log(`  ${line(issue)}  ${dim(issue.url)}`);
  if (isAssumeYes()) {
    info(`opening a new issue; pass ${cyan(`--add-to ${duplicates[0].number}`)} to add your report to an existing one instead.`);
    return null;
  }
  const choice = await select("Add your report to one of them, or open a new issue?", [
    ...duplicates.slice(0, 3).map((issue) => ({ value: issue.number, label: `Add it to #${issue.number} ${issue.title}` })),
    { value: 0, label: "Open a new issue" },
  ]);
  if (choice === null) fail("Choose one of the listed numbers. Nothing was sent.");
  return choice || null;
}
