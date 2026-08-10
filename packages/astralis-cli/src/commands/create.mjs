import { existsSync, writeFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { ok, warn, info, fail, bold, cyan, dim, ask } from "../lib/ui.mjs";
import { findEntryFile } from "../lib/detect.mjs";
import { starterFile, starterCleanup } from "../lib/starter.mjs";

/**
 * Scaffold a brand-new project and wire Astralis into it. We own NO project
 * templates: the official scaffolder (create-next-app / create-vite) runs
 * interactively with its own prompts — TS, ESLint, Tailwind stay the user's
 * call, exactly as if they'd run it directly — and our `init` runs on the
 * result. Any extra args are forwarded verbatim to the scaffolder, so
 * non-interactive use works too:
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

/**
 * Astralis is a React library — react and react-dom are its peer dependencies
 * and every component is JSX. So the Vite path names a React template rather
 * than letting create-vite offer its full menu: picking Vue there scaffolded a
 * project the library cannot be used in, and the failure only surfaced two
 * steps later when wiring found no React.
 *
 * `--template` selects framework AND variant together, so naming one also
 * skips create-vite's TypeScript/JavaScript question. That is a choice the
 * caller still owns, so we ask it ourselves and map the answer here.
 */
const VITE_TEMPLATES = { ts: "react-ts", js: "react" };
const DEFAULT_VITE_TEMPLATE = VITE_TEMPLATES.ts;

/** One shell command string (spawned with shell:true — pm binaries are .cmd shims on Windows). */
export function buildScaffoldCommand(
  framework,
  name,
  forwarded,
  pm,
  template = DEFAULT_VITE_TEMPLATE,
) {
  // yarn classic's `create` chokes on @latest tags; everyone else wants them.
  const tag = pm === "yarn" ? "" : "@latest";
  const scaffolder = framework === "next" ? `next-app${tag}` : `vite${tag}`;

  const args = [...forwarded];

  // Name the template so create-vite never offers Vue, Svelte and friends.
  // `template` carries the language the caller chose — see VITE_TEMPLATES.
  if (framework === "vite" && !args.some((arg) => TEMPLATE_FLAGS.has(arg))) {
    args.push("--template", template);
  }

  /*
   * create-vite offers to "install with npm and start now", and answering yes
   * runs a dev server that never exits. Our wiring step sits behind that spawn,
   * so it would never run and the user would be handed a plain Vite app with no
   * Astralis in it — which is exactly what happened. Opt out by default; a
   * caller who passes -i/--immediate themselves has chosen to skip our wiring.
   */
  if (framework === "vite" && !args.some((arg) => IMMEDIATE_FLAGS.has(arg))) {
    args.push("--no-immediate");
  }

  // npm swallows flags meant for the scaffolder unless they sit behind `--`.
  const separator = pm === "npm" && args.length > 0 ? ["--"] : [];
  return [pm, "create", scaffolder, name, ...separator, ...args].filter(Boolean).join(" ");
}

async function promptFramework() {
  // Via ask(), which reads in a child process — this process must never touch
  // stdin, or the scaffolder it spawns next will not receive a keystroke.
  const answer = await ask(
    `${bold("Framework?")}  ${cyan("1")} Next.js   ${cyan("2")} React ${dim("(Vite)")}  `,
  );
  const choice = answer.trim().toLowerCase();
  if (choice === "1" || choice === "next" || choice === "next.js" || choice === "nextjs") return "next";
  if (choice === "2" || choice === "vite" || choice === "react") return "vite";
  return null;
}

/**
 * The question create-vite would have asked, had we not named its template.
 * create-next-app still asks this itself, so it is only needed on the Vite
 * path. Anything unrecognised — including an empty answer on piped input —
 * falls back to TypeScript.
 */
async function promptLanguage() {
  const answer = await ask(
    `${bold("Language?")}  ${cyan("1")} TypeScript   ${cyan("2")} JavaScript  `,
  );
  const choice = answer.trim().toLowerCase();
  if (choice === "2" || choice === "js" || choice === "javascript") return VITE_TEMPLATES.js;
  return VITE_TEMPLATES.ts;
}

export async function run(argv) {
  // Manual parse: --framework is ours, first bare word is the name,
  // EVERYTHING else is forwarded untouched to the scaffolder.
  let framework;
  let name;
  let starter = true;
  const forwarded = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--framework") framework = argv[++i];
    // Ours, not the scaffolder's — consume it so it isn't forwarded.
    else if (arg === "--no-starter") starter = false;
    else if (!name && !arg.startsWith("-")) name = arg;
    else forwarded.push(arg);
  }

  if (!name) fail('Usage: astralis create <project-name> [--framework next|vite] [scaffolder args…]');
  if (!/^[a-z0-9@][a-z0-9-_.]*$/i.test(name)) fail(`"${name}" isn't a safe project name.`);
  if (existsSync(join(process.cwd(), name))) fail(`./${name} already exists.`);

  framework ??= await promptFramework();
  if (framework !== "next" && framework !== "vite") fail('Pick a framework: "next" or "vite".');

  /*
   * Ask the language only when we are the ones naming the template, and only
   * when there is somebody to answer: a caller who passed their own
   * `--template` has already decided, and a non-interactive run (CI, piped
   * input) must not block on a question. Both fall through to TypeScript.
   */
  const namesOwnTemplate = forwarded.some((arg) => TEMPLATE_FLAGS.has(arg));
  const template =
    framework === "vite" && !namesOwnTemplate && process.stdin.isTTY
      ? await promptLanguage()
      : DEFAULT_VITE_TEMPLATE;

  const pm = invokingPackageManager();
  const command = buildScaffoldCommand(framework, name, forwarded, pm, template);

  // If they asked create-vite to start a dev server, it never returns and this
  // process never gets to wire anything. Say so rather than appear to fail.
  const startsDevServer = forwarded.some((arg) => arg === "-i" || arg === "--immediate");
  if (startsDevServer) {
    warn("--immediate starts a dev server that doesn't exit, so Astralis can't be wired in afterwards.");
    console.log(dim(`  Run ${cyan("astralis init")} inside ./${name} once you've stopped it.`));
  }
  info(`${bold(command)} ${dim("(the scaffolder's own prompts — answer them as usual)")}`);

  // The scaffolder's menu is arrow-driven and needs sole ownership of the
  // console. That works because ask() reads in a child process, so this one
  // has never opened stdin — see the note on ask() in lib/ui.mjs.
  const scaffold = spawnSync(command, { stdio: "inherit", shell: true });
  if (scaffold.status !== 0) fail("Scaffolding failed or was cancelled — nothing to wire up.");
  if (!existsSync(join(process.cwd(), name, "package.json"))) {
    fail(`Expected ./${name}/package.json after scaffolding — did the scaffolder use a different directory?`);
  }

  ok(`project created in ./${name}`);
  console.log();
  info("wiring Astralis into it…");
  process.chdir(name);
  const init = await import("./init.mjs");
  await init.run([], { nested: true });

  /*
   * Replace the scaffolder's demo page with one built from Astralis.
   *
   * Only here, never in `init` — init runs on projects that already exist,
   * where overwriting someone's entry component would be vandalism. On a
   * directory the scaffolder created seconds ago there is nothing to lose,
   * and it turns "did init work?" from a package.json inspection into
   * something visible on first `dev`.
   */
  if (starter) {
    const entry = findEntryFile(process.cwd(), framework);
    if (entry) {
      const shown = (p) => relative(process.cwd(), p).split("\\").join("/");

      const { path, source } = starterFile(framework, entry.path);
      writeFileSync(path, source);

      // The template's demo CSS centres and re-colours everything it wraps, so
      // it has to go with the demo it was written for. Reported as one line:
      // clearing the scaffolder's own leftovers is part of writing the screen,
      // not three separate things the reader has to follow.
      const cleanup = starterCleanup(framework, entry.path);
      for (const file of cleanup.rewrite) {
        if (existsSync(file.path)) writeFileSync(file.path, file.source);
      }
      for (const orphan of cleanup.remove) {
        if (existsSync(orphan)) rmSync(orphan);
      }

      ok(`welcome screen written ${dim(`(${shown(path)})`)}`);
    }
  }

  console.log(`\n${bold("Next steps:")}\n  ${cyan(`cd ${name}`)}\n  ${cyan(`${pm} run dev`)}`);
}
