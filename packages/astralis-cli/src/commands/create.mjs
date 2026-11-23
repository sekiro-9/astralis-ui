import { existsSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { ok, warn, info, fail, bold, cyan, dim, ask, isAssumeYes, menu, posix, printBanner } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { runCommand, UnsafeArgumentError } from "../lib/run.mjs";
import { findEntryFile } from "../lib/detect.mjs";
import { starterFile, starterCleanup } from "../lib/starter.mjs";
import { DOCS, commandProblem, createGuide, formatGuide, printGuide, tryWrite } from "../lib/manual.mjs";
import { likelyEntry } from "../lib/wiring.mjs";

/**
 * Scaffold a brand-new project and wire Astralis into it. We own NO project
 * templates: the official scaffolder (create-next-app / create-vite) runs with
 * its own prompts, so TS, ESLint and Tailwind stay the user's call, and our
 * `init` runs on the result. Unrecognised args are forwarded verbatim to the
 * scaffolder:
 *
 *   astralis create my-app --framework vite --template react
 */

/** The package manager that invoked us — `pnpm create astralis` should scaffold with pnpm. */
export function invokingPackageManager(userAgent = process.env.npm_config_user_agent ?? "") {
  const name = userAgent.split("/")[0];
  return ["pnpm", "yarn", "bun"].includes(name) ? name : "npm";
}

/** Did the caller already decide about create-vite's install-and-start step? */
const IMMEDIATE_FLAGS = new Set(["-i", "--immediate", "--no-immediate"]);

/** Did the caller pick their own template? */
const TEMPLATE_FLAGS = new Set(["-t", "--template"]);

/** Each scaffolder's own switch for "ask nothing", passed on under --yes. */
const NON_INTERACTIVE_FLAG = { next: "--yes", vite: "--no-interactive" };

/**
 * Astralis is a React library, so the Vite path names a React template rather
 * than letting create-vite offer Vue and friends (picking one scaffolded a
 * project the library can't be used in). Naming the template also skips
 * create-vite's TypeScript/JavaScript question, so we ask it and map it here.
 */
const VITE_TEMPLATES = { ts: "react-ts", js: "react" };
const DEFAULT_VITE_TEMPLATE = VITE_TEMPLATES.ts;

/** The scaffolder's argv: [pm, "create", scaffolder, name, ...args]. */
export function buildScaffoldCommand(
  framework,
  name,
  forwarded,
  pm,
  template = DEFAULT_VITE_TEMPLATE,
  { yes = false } = {},
) {
  // yarn classic's `create` chokes on @latest tags; everyone else wants them.
  const tag = pm === "yarn" ? "" : "@latest";
  const scaffolder = framework === "next" ? `next-app${tag}` : `vite${tag}`;

  const args = [...forwarded];

  if (framework === "vite" && !args.some((arg) => TEMPLATE_FLAGS.has(arg))) {
    args.push("--template", template);
  }

  // create-vite's "install and start now" runs a dev server that never exits,
  // so our wiring step behind it would never run. Opt out unless the caller
  // chose for themselves.
  if (framework === "vite" && !args.some((arg) => IMMEDIATE_FLAGS.has(arg))) {
    args.push("--no-immediate");
  }

  if (yes && !args.includes(NON_INTERACTIVE_FLAG[framework])) args.push(NON_INTERACTIVE_FLAG[framework]);

  // npm swallows flags meant for the scaffolder unless they sit behind `--`.
  const separator = pm === "npm" && args.length > 0 ? ["--"] : [];
  return [pm, "create", scaffolder, name, ...separator, ...args];
}

function promptFramework() {
  const chosen = menu("Which framework?", [
    { label: "Next.js", hint: "App Router; Server Components render with no library JavaScript" },
    { label: "React (Vite)", hint: "A client-rendered single-page app" },
  ]);
  if (chosen !== null) return chosen === 0 ? "next" : "vite";
  const answer = ask(`${bold("Framework?")}  ${cyan("1")} Next.js   ${cyan("2")} React ${dim("(Vite)")}  `);
  if (answer === null) fail(`No framework chosen and no input to read — pass ${cyan("--framework next|vite")}.`);
  const choice = answer.toLowerCase();
  if (choice === "1" || choice === "next" || choice === "next.js" || choice === "nextjs") return "next";
  if (choice === "2" || choice === "vite" || choice === "react") return "vite";
  return null;
}

/** create-vite's own language question; anything unrecognised, or no answer, means TypeScript. */
function promptLanguage() {
  const chosen = menu("Which language?", [{ label: "TypeScript", hint: "Recommended: the props are typed" }, { label: "JavaScript" }]);
  if (chosen !== null) return chosen === 1 ? VITE_TEMPLATES.js : VITE_TEMPLATES.ts;
  const answer = ask(`${bold("Language?")}  ${cyan("1")} TypeScript   ${cyan("2")} JavaScript  `)?.toLowerCase();
  return answer === "2" || answer === "js" || answer === "javascript" ? VITE_TEMPLATES.js : VITE_TEMPLATES.ts;
}

/** The welcome screen in place of the scaffolder's demo, or the steps that put a first page there. */
function writeStarter(cwd, framework, pm) {
  const entry = findEntryFile(cwd, framework);
  const { path, source } = starterFile(framework, entry?.path ?? join(cwd, likelyEntry(cwd, framework).file));
  const shown = posix(relative(cwd, path));
  const guide = createGuide({
    title: "The welcome screen isn't in place",
    docs: DOCS.create,
    check: `run ${pm} run dev: the page shows a styled button.`,
  });
  const pageStep = () => guide.step(`Open ${shown} and replace what is in it with a first page of your own:`, FIRST_PAGE);

  if (!entry) {
    guide.because("the project's entry file wasn't found, so the scaffolder's demo page was kept");
    pageStep();
    return printGuide(guide);
  }
  const problem = tryWrite(path, source);
  if (problem) {
    guide.because(`${shown} couldn't be written: ${problem}`, { failed: true });
    pageStep();
  } else {
    ok(`welcome screen written ${dim(`(${shown})`)}`);
  }

  // The template's demo CSS centres and re-colours everything, so it goes with its demo.
  const cleanup = starterCleanup(framework, entry.path);
  for (const file of cleanup.rewrite) {
    const unwritten = existsSync(file.path) && tryWrite(file.path, file.source);
    if (!unwritten) continue;
    const css = posix(relative(cwd, file.path));
    guide.because(`${css} couldn't be replaced, and its demo styles fight the page: ${unwritten}`);
    guide.step(`Open ${css} and replace what is in it with:`, file.source);
  }
  for (const orphan of cleanup.remove) {
    try {
      rmSync(orphan, { force: true });
    } catch {
      // Nothing imports it any more, so a file that won't delete is only clutter.
    }
  }
  printGuide(guide);
}

const FIRST_PAGE = `import { Button } from "astralis-ui";

export default function Home() {
  return <Button colorScheme="brand">Hello</Button>;
}`;

export async function run(argv) {
  const args = parseCommandArgs(commandNamed("create"), argv);
  if (!args) return;
  const { values, forwarded } = args;
  const [name] = args.positionals;
  const yes = isAssumeYes();

  if (!name) fail(`Name the project: ${cyan("npx astralis-cli create <name>")}.`);
  printBanner(`Creating ${name}`);
  if (!/^[a-z0-9@][a-z0-9-_.]*$/i.test(name)) fail(`"${name}" isn't a safe project name.`);
  if (existsSync(join(process.cwd(), name))) fail(`./${name} already exists.`);

  let framework = values.framework;
  if (framework === undefined) {
    if (yes) fail(`--yes can't choose the framework — pass ${cyan("--framework next|vite")}.`);
    framework = promptFramework();
  }
  if (framework !== "next" && framework !== "vite") fail('Pick a framework: "next" or "vite".');

  // Only ask the language when we name the template and someone can answer.
  const namesOwnTemplate = forwarded.some((arg) => TEMPLATE_FLAGS.has(arg));
  const template =
    framework === "vite" && !namesOwnTemplate && !yes && process.stdin.isTTY ? promptLanguage() : DEFAULT_VITE_TEMPLATE;

  const pm = invokingPackageManager();
  const [bin, ...scaffoldArgs] = buildScaffoldCommand(framework, name, forwarded, pm, template, { yes });

  if (forwarded.some((arg) => arg === "-i" || arg === "--immediate")) {
    warn("--immediate starts a dev server that doesn't exit, so Astralis can't be wired in afterwards.");
    console.log(dim(`  Run ${cyan("npx astralis-cli init")} inside ./${name} once you've stopped it.`));
  }
  info(`${bold([bin, ...scaffoldArgs].join(" "))} ${dim("(the scaffolder's own prompts — answer them as usual)")}`);

  // The scaffolder's arrow-key menu needs the console to itself, which holds
  // because this process has never read stdin (see lib/prompt-child.mjs).
  let scaffold;
  try {
    scaffold = runCommand(bin, scaffoldArgs);
  } catch (error) {
    if (error instanceof UnsafeArgumentError) fail(`Couldn't forward that to the scaffolder: ${error.message}.`);
    throw error;
  }
  const wireCommand = `npx astralis-cli init${values["no-devtools"] ? "" : " --devtools"}`;
  if (scaffold.status !== 0) {
    const guide = createGuide({ title: "Scaffolding failed or was cancelled, so there is nothing to wire up", docs: DOCS.create })
      .because(`${[bin, ...scaffoldArgs].join(" ")}: ${commandProblem(scaffold)}`)
      .step(`Delete ./${name} if it was half made, then run the scaffolder yourself:`, [bin, ...scaffoldArgs].join(" "))
      .step("Wire Astralis in:", `cd ${name}\n${wireCommand}`);
    fail(formatGuide(guide));
  }
  if (!existsSync(join(process.cwd(), name, "package.json"))) {
    const guide = createGuide({ title: "The project was scaffolded, but Astralis isn't wired in", docs: DOCS.create })
      .because(`Expected ./${name}/package.json. The scaffolder may have used a different directory`)
      .step("Go to the folder it made, the one that holds package.json, and wire Astralis in:", `cd path/to/that-folder\n${wireCommand}`);
    fail(formatGuide(guide));
  }

  ok(`project created in ./${name}`);
  console.log();
  info("wiring Astralis into it…");
  process.chdir(name);
  const init = await import("./init.mjs");
  await init.run(values["no-devtools"] ? [] : ["--devtools"], { nested: true, pm });

  /*
   * Replace the scaffolder's demo page with one built from Astralis. Only
   * here, never in `init`: on a directory scaffolded seconds ago there is
   * nothing to lose, and it makes "did init work?" visible on first `dev`.
   */
  if (!values["no-starter"]) {
    writeStarter(process.cwd(), framework, pm);
  }

  console.log(`\n${bold("Next steps:")}\n  ${cyan(`cd ${name}`)}\n  ${cyan(`${pm} run dev`)}`);
}
