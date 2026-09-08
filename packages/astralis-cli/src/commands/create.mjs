import { existsSync, writeFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { ok, warn, info, fail, bold, cyan, dim, ask, isAssumeYes, posix } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { runCommand, UnsafeArgumentError } from "../lib/run.mjs";
import { findEntryFile } from "../lib/detect.mjs";
import { starterFile, starterCleanup } from "../lib/starter.mjs";

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
  const answer = ask(`${bold("Framework?")}  ${cyan("1")} Next.js   ${cyan("2")} React ${dim("(Vite)")}  `);
  if (answer === null) fail(`No framework chosen and no input to read — pass ${cyan("--framework next|vite")}.`);
  const choice = answer.toLowerCase();
  if (choice === "1" || choice === "next" || choice === "next.js" || choice === "nextjs") return "next";
  if (choice === "2" || choice === "vite" || choice === "react") return "vite";
  return null;
}

/** create-vite's own language question; anything unrecognised, or no answer, means TypeScript. */
function promptLanguage() {
  const answer = ask(`${bold("Language?")}  ${cyan("1")} TypeScript   ${cyan("2")} JavaScript  `)?.toLowerCase();
  return answer === "2" || answer === "js" || answer === "javascript" ? VITE_TEMPLATES.js : VITE_TEMPLATES.ts;
}

export async function run(argv) {
  const args = parseCommandArgs(commandNamed("create"), argv);
  if (!args) return;
  const { values, forwarded } = args;
  const [name] = args.positionals;
  const yes = isAssumeYes();

  if (!name) fail(`Name the project: ${cyan("astralis create <name>")}.`);
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
    console.log(dim(`  Run ${cyan("astralis init")} inside ./${name} once you've stopped it.`));
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
  if (scaffold.status !== 0) fail("Scaffolding failed or was cancelled — nothing to wire up.");
  if (!existsSync(join(process.cwd(), name, "package.json"))) {
    fail(`Expected ./${name}/package.json after scaffolding — did the scaffolder use a different directory?`);
  }

  ok(`project created in ./${name}`);
  console.log();
  info("wiring Astralis into it…");
  process.chdir(name);
  const init = await import("./init.mjs");
  await init.run([], { nested: true, pm });

  /*
   * Replace the scaffolder's demo page with one built from Astralis. Only
   * here, never in `init`: on a directory scaffolded seconds ago there is
   * nothing to lose, and it makes "did init work?" visible on first `dev`.
   */
  if (!values["no-starter"]) {
    const entry = findEntryFile(process.cwd(), framework);
    if (entry) {
      const { path, source } = starterFile(framework, entry.path);
      writeFileSync(path, source);

      // The template's demo CSS centres and re-colours everything, so it goes with its demo.
      const cleanup = starterCleanup(framework, entry.path);
      for (const file of cleanup.rewrite) {
        if (existsSync(file.path)) writeFileSync(file.path, file.source);
      }
      for (const orphan of cleanup.remove) {
        if (existsSync(orphan)) rmSync(orphan);
      }

      ok(`welcome screen written ${dim(`(${posix(relative(process.cwd(), path))})`)}`);
    }
  }

  console.log(`\n${bold("Next steps:")}\n  ${cyan(`cd ${name}`)}\n  ${cyan(`${pm} run dev`)}`);
}
