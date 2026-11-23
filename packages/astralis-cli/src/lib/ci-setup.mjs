import { existsSync } from "node:fs";
import { join } from "node:path";
import { ok, warn, info, bold, dim, cyan, posix } from "./ui.mjs";
import { runCommand } from "./run.mjs";
import { DOCS, commandProblem, createGuide, tryRead, tryWrite } from "./manual.mjs";
import { CHECK_NAME, WORKFLOW_FILE, inspectProject, validateScript, withScript, workflowYaml } from "./ci.mjs";

const VALIDATE_COMMAND = "astralis validate";

/**
 * The --ci half of `astralis init`: astralis-cli pinned as a devDependency, a
 * package.json script that runs the validator, and a GitHub Actions workflow
 * that runs the script. Reports through init's buffered `out` so a re-run that
 * changes nothing stays one line. Returns { notes, guide }: notes to read, and
 * what is left to do by hand.
 */
export function setUpCi({ cwd, pkg, pm, dryRun, force, out, command }) {
  const notes = [];
  const check = (script) => `run \`${pm} run ${script}\`, then open a pull request: "${CHECK_NAME}" runs on it.`;
  const guide = createGuide({
    title: "The CI check isn't fully set up yet",
    docs: DOCS.ci,
    check: check("validate"),
    retry: command,
  });
  const result = { notes, guide };
  const had = (name) => Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);

  if (had("astralis-cli")) {
    out.step(() => ok("astralis-cli already in dependencies"));
  } else if (dryRun) {
    out.changed();
    out.step(() => info(`would run: ${pm} add -D astralis-cli`));
  } else {
    out.changed();
    out.flush();
    info(`installing astralis-cli with ${pm}, pinned for CI…`);
    const installed = runCommand(pm, ["add", "-D", "astralis-cli"], { cwd });
    if (installed.status === 0) {
      ok("astralis-cli installed as a devDependency");
    } else {
      warn(`${pm} add -D astralis-cli failed; carrying on with the rest`);
      guide.because(`astralis-cli wasn't installed: ${commandProblem(installed)}`, { failed: true });
      guide.step("Install it from your project's root, and commit the lockfile:", `${pm} add -D astralis-cli`);
    }
  }

  // The install above rewrites package.json, so read it again before adding to it.
  const packagePath = join(cwd, "package.json");
  const { text: packageText, problem: packageProblem } = tryRead(packagePath);
  let scripts;
  try {
    scripts = JSON.parse(packageText).scripts;
  } catch {
    guide.because(`package.json couldn't be read: ${packageProblem ?? "it isn't valid JSON"}`, { failed: true });
    guide.step("Open package.json, make it readable and valid, and add this to its scripts:", `"validate": "${VALIDATE_COMMAND}"`);
    guide.step("Then have init write the workflow:", command);
    return result;
  }
  const script = validateScript(scripts);
  if (!script) {
    guide.because('package.json\'s "validate" and "astralis:validate" scripts both do something else, so there was no name left to use');
    guide.step("Open package.json and have your validate script run the validator too:", `"validate": ${JSON.stringify(`${scripts.validate} && ${VALIDATE_COMMAND}`)}`);
    guide.step("Then have init write the workflow:", command);
    return result;
  }
  guide.check = check(script.name);
  if (!script.isNew) {
    out.step(() => ok(`"${script.name}" script already runs the validator`));
  } else {
    const problem = tryWrite(packagePath, withScript(packageText, script.name, VALIDATE_COMMAND), { dryRun });
    if (problem) {
      guide.because(`package.json couldn't be written: ${problem}`, { failed: true });
      guide.step("Open package.json and add this to its scripts:", `"${script.name}": "${VALIDATE_COMMAND}"`);
    } else {
      out.changed();
      out.step(() => ok(`${dryRun ? "would add" : "added"} "${script.name}": "${VALIDATE_COMMAND}" ${dim("(package.json)")}`));
    }
  }

  const project = inspectProject(cwd, pkg, pm);
  const root = project.gitRoot ?? cwd;
  const shown = posix(join(".github", "workflows", WORKFLOW_FILE));
  const path = join(root, shown);
  const yaml = workflowYaml(project, script.name);
  const read = existsSync(path) ? tryRead(path) : { text: null };
  const existing = read.text ?? null;

  const problem =
    read.problem ?? (existing === yaml || (existing !== null && !force) ? null : tryWrite(path, yaml, { dryRun }));
  if (problem) {
    guide.because(`${shown} couldn't be ${read.problem ? "read" : "written"}: ${problem}`, { failed: true });
    guide.step(`Create ${posix(path)} with:`, yaml);
  } else if (existing === yaml) {
    out.step(() => ok(`${shown} already present`));
  } else if (existing !== null && !force) {
    notes.push(`${shown} already exists and differs from what init would write; it was left alone (--force replaces it)`);
  } else {
    out.changed();
    out.step(() => ok(`${dryRun ? "would write" : existing === null ? "wrote" : "replaced"} ${shown}${project.subdir ? dim(` (at the repository root; runs in ${project.subdir})`) : ""}`));
    out.after(() => {
      console.log(`\n${bold("CI:")} push, then make ${cyan(`"${CHECK_NAME}"`)} a required status check so a failing run blocks the merge:`);
      console.log(`  GitHub → Settings → Rules → Rulesets (or Branches → branch protection) → Require status checks to pass.`);
    });
  }

  if (!project.gitRoot) {
    guide.because("This folder isn't in a git repository, so GitHub has nothing to run the check on yet");
    guide.step("Make it one, from this folder:", 'git init -b main\ngit add -A\ngit commit -m "First commit"');
    guide.step(
      "Create an empty repository on GitHub and push to it (use its own address):",
      "git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git\ngit push -u origin main",
    );
  }

  if (!project.lockfile) {
    notes.push(`no ${pm} lockfile found — commit one so CI installs the same versions you tested`);
  }
  return result;
}
