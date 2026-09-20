import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { posix } from "./ui.mjs";

/** What `astralis init --ci` writes, and where. */

export const WORKFLOW_FILE = "astralis-validate.yml";
export const CHECK_NAME = "Astralis validate";

const ACTIONS = {
  checkout: "actions/checkout@v7",
  node: "actions/setup-node@v7",
  pnpm: "pnpm/action-setup@v6",
  bun: "oven-sh/setup-bun@v2",
};
const NODE_VERSION = 22;

const LOCKFILES = {
  npm: ["package-lock.json"],
  pnpm: ["pnpm-lock.yaml"],
  yarn: ["yarn.lock"],
  bun: ["bun.lock", "bun.lockb"],
};

const SCRIPT_NAMES = ["validate", "astralis:validate"];
const RUNS_ASTRALIS_VALIDATE = /(^|[\s;&|])(npx\s+)?astralis(-cli)?\s+validate\b/;

/**
 * The package.json script the workflow runs: an existing one that already calls
 * `astralis validate`, else the first free name. Null when every name is taken
 * by something else, so nothing of the user's is overwritten.
 */
export function validateScript(scripts = {}) {
  for (const name of SCRIPT_NAMES) {
    if (scripts[name] !== undefined && RUNS_ASTRALIS_VALIDATE.test(scripts[name])) return { name, isNew: false };
  }
  const free = SCRIPT_NAMES.find((name) => scripts[name] === undefined);
  return free ? { name: free, isNew: true } : null;
}

/** The nearest directory at or above `start` holding .git, or null outside a repository. */
export function findGitRoot(start) {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const declaredManager = (pkg, name) => {
  const match = /^([a-z]+)@(\d+)/.exec(pkg?.packageManager ?? "");
  return match && match[1] === name ? Number(match[2]) : null;
};

function localPnpmMajor(cwd) {
  const result = spawnSync(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["--version"], {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const major = /^(\d+)\./.exec(result.stdout ?? "")?.[1];
  return major ? Number(major) : null;
}

/**
 * Everything the workflow depends on, read from the project. `pnpmVersion` is
 * null when package.json's packageManager already pins pnpm: pnpm/action-setup
 * reads it there and refuses a second, conflicting version.
 */
export function inspectProject(cwd, pkg, pm) {
  const lockfile = LOCKFILES[pm].find((name) => existsSync(join(cwd, name))) ?? null;
  const gitRoot = findGitRoot(cwd);
  const subdir = gitRoot && gitRoot !== cwd ? posix(relative(gitRoot, cwd)) : "";
  const pnpmPinned = declaredManager(pkg, "pnpm") !== null;
  return {
    pm,
    lockfile,
    gitRoot,
    subdir,
    pnpmVersion: pm === "pnpm" && !pnpmPinned ? (localPnpmMajor(cwd) ?? 10) : null,
    pnpmPinned,
    yarnBerry: pm === "yarn" && ((declaredManager(pkg, "yarn") ?? 1) >= 2 || existsSync(join(cwd, ".yarnrc.yml"))),
  };
}

function installCommand({ pm, lockfile, yarnBerry }) {
  if (pm === "npm") return lockfile ? "npm ci" : "npm install";
  if (pm === "pnpm") return "pnpm install --frozen-lockfile";
  if (pm === "yarn") return yarnBerry ? "yarn install --immutable" : "yarn install --frozen-lockfile";
  return "bun install --frozen-lockfile";
}

const inSubdir = (subdir, file) => (subdir ? `${subdir}/${file}` : file);

/** The workflow file's text. Pure: every input comes from inspectProject(). */
export function workflowYaml(project, scriptName) {
  const { pm, lockfile, subdir, pnpmVersion, pnpmPinned, yarnBerry } = project;
  const steps = [`      - uses: ${ACTIONS.checkout}`];

  if (pm === "pnpm") {
    const inputs = [];
    if (pnpmVersion) inputs.push(`version: ${pnpmVersion}`);
    if (pnpmPinned && subdir) inputs.push(`package_json_file: ${inSubdir(subdir, "package.json")}`);
    steps.push(`      - uses: ${ACTIONS.pnpm}${inputs.map((line, i) => `${i ? "" : "\n        with:"}\n          ${line}`).join("")}`);
  }
  if (pm === "yarn" && yarnBerry) steps.push("      - run: corepack enable");
  if (pm === "bun") steps.push(`      - uses: ${ACTIONS.bun}`);

  const node = [`node-version: ${NODE_VERSION}`];
  if (pm !== "bun" && lockfile) {
    node.push(`cache: ${pm}`);
    if (subdir) node.push(`cache-dependency-path: ${inSubdir(subdir, lockfile)}`);
  }
  steps.push(`      - uses: ${ACTIONS.node}\n        with:${node.map((line) => `\n          ${line}`).join("")}`);
  steps.push(`      - run: ${installCommand(project)}`, `      - run: ${pm} run ${scriptName}`);

  return [
    `# Checks every pull request against the astralis-ui design system; written by`,
    `# \`astralis init --ci\`. Make "${CHECK_NAME}" a required status check so a`,
    `# failing run blocks the merge: GitHub → Settings → Rules (or Branches).`,
    `name: ${CHECK_NAME}`,
    "",
    "on:",
    "  pull_request:",
    "  push:",
    "    branches: [main, master]",
    "",
    "permissions:",
    "  contents: read",
    "",
    "jobs:",
    "  validate:",
    `    name: ${CHECK_NAME}`,
    "    runs-on: ubuntu-latest",
    ...(subdir ? ["    defaults:", "      run:", `        working-directory: ${subdir}`] : []),
    "    steps:",
    ...steps,
    "",
  ].join("\n");
}

/** package.json with one script added, keeping the file's own indentation and final newline. */
export function withScript(packageJsonText, name, command) {
  const pkg = JSON.parse(packageJsonText);
  pkg.scripts = { ...pkg.scripts, [name]: command };
  const indent = /^[ \t]+(?=")/m.exec(packageJsonText)?.[0] ?? "  ";
  const eol = packageJsonText.includes("\r\n") ? "\r\n" : "\n";
  const text = JSON.stringify(pkg, null, indent).replaceAll("\n", eol);
  return /\r?\n$/.test(packageJsonText) ? text + eol : text;
}

export const readText = (path) => (existsSync(path) ? readFileSync(path, "utf8") : null);
