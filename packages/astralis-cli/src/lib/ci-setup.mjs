import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ok, info, fail, bold, dim, cyan, posix } from "./ui.mjs";
import { runCommand } from "./run.mjs";
import { CHECK_NAME, WORKFLOW_FILE, inspectProject, readText, validateScript, withScript, workflowYaml } from "./ci.mjs";

const VALIDATE_COMMAND = "astralis validate";

/**
 * The --ci half of `astralis init`: astralis-cli pinned as a devDependency, a
 * package.json script that runs the validator, and a GitHub Actions workflow
 * that runs the script. Reports through init's buffered `out` so a re-run that
 * changes nothing stays one line. Returns notes that need the user's attention.
 */
export function setUpCi({ cwd, pkg, pm, dryRun, force, out }) {
  const notes = [];
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
    const result = runCommand(pm, ["add", "-D", "astralis-cli"], { cwd });
    if (result.status !== 0) fail(`${pm} add -D astralis-cli failed — install it manually, then re-run init --ci.`);
    ok("astralis-cli installed as a devDependency");
  }

  // The install above rewrites package.json, so read it again before adding to it.
  const packagePath = join(cwd, "package.json");
  const packageText = readFileSync(packagePath, "utf8");
  const script = validateScript(JSON.parse(packageText).scripts);
  if (!script) {
    notes.push(`package.json's "validate" and "astralis:validate" scripts both do something else — add one that runs \`${VALIDATE_COMMAND}\` and re-run init --ci`);
    return notes;
  }
  if (!script.isNew) {
    out.step(() => ok(`"${script.name}" script already runs the validator`));
  } else {
    out.changed();
    out.step(() => ok(`${dryRun ? "would add" : "added"} "${script.name}": "${VALIDATE_COMMAND}" ${dim("(package.json)")}`));
    if (!dryRun) writeFileSync(packagePath, withScript(packageText, script.name, VALIDATE_COMMAND));
  }

  const project = inspectProject(cwd, pkg, pm);
  const root = project.gitRoot ?? cwd;
  const shown = posix(join(".github", "workflows", WORKFLOW_FILE));
  const path = join(root, shown);
  const yaml = workflowYaml(project, script.name);
  const existing = readText(path);

  if (existing === yaml) {
    out.step(() => ok(`${shown} already present`));
  } else if (existing !== null && !force) {
    notes.push(`${shown} already exists and differs from what init would write; it was left alone (--force replaces it)`);
  } else {
    out.changed();
    out.step(() => ok(`${dryRun ? "would write" : existing === null ? "wrote" : "replaced"} ${shown}${project.subdir ? dim(` (at the repository root; runs in ${project.subdir})`) : ""}`));
    if (!dryRun) {
      mkdirSync(join(root, ".github", "workflows"), { recursive: true });
      writeFileSync(path, yaml);
    }
    out.after(() => {
      console.log(`\n${bold("CI:")} push, then make ${cyan(`"${CHECK_NAME}"`)} a required status check so a failing run blocks the merge:`);
      console.log(`  GitHub → Settings → Rules → Rulesets (or Branches → branch protection) → Require status checks to pass.`);
      if (!project.gitRoot) console.log(dim("  This folder isn't a git repository yet; GitHub runs the workflow once it is pushed as one."));
    });
  }

  if (!project.lockfile) {
    notes.push(`no ${pm} lockfile found — commit one so CI installs the same versions you tested`);
  }
  return notes;
}
