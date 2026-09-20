import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { validateScript, withScript, workflowYaml, inspectProject } from "../src/lib/ci.mjs";
import { annotation, repositoryPath } from "../src/lib/github-annotations.mjs";
import { tempProject } from "./helpers.mjs";

const project = (overrides) => ({
  pm: "npm",
  lockfile: "package-lock.json",
  gitRoot: "/repo",
  subdir: "",
  pnpmVersion: null,
  pnpmPinned: false,
  yarnBerry: false,
  ...overrides,
});

const steps = (yaml) => yaml.split("\n    steps:\n")[1];

test("the validate script is added under the first free name, and an existing one is reused", () => {
  assert.deepEqual(validateScript(undefined), { name: "validate", isNew: true });
  assert.deepEqual(validateScript({ validate: "astralis validate app" }), { name: "validate", isNew: false });
  assert.deepEqual(validateScript({ validate: "npx astralis-cli validate src" }), { name: "validate", isNew: false });
  assert.deepEqual(validateScript({ validate: "tsc && eslint ." }), { name: "astralis:validate", isNew: true });
  assert.deepEqual(validateScript({ validate: "tsc", "astralis:validate": "astralis validate" }), {
    name: "astralis:validate",
    isNew: false,
  });
  assert.equal(validateScript({ validate: "tsc", "astralis:validate": "echo" }), null);
});

test("a script that merely mentions astralis is not mistaken for the validator", () => {
  assert.equal(validateScript({ validate: "node scripts/validate-astralis.mjs" }).name, "astralis:validate");
  assert.equal(validateScript({ validate: "astralis-validate-docs" }).name, "astralis:validate");
});

test("npm with a lockfile installs with npm ci and caches; without one it installs plainly", () => {
  const withLock = steps(workflowYaml(project(), "validate"));
  assert.match(withLock, /uses: actions\/setup-node@v7\n {8}with:\n {10}node-version: 22\n {10}cache: npm\n/);
  assert.match(withLock, /- run: npm ci\n {6}- run: npm run validate\n$/);

  const noLock = steps(workflowYaml(project({ lockfile: null }), "validate"));
  assert.doesNotMatch(noLock, /cache:/);
  assert.match(noLock, /- run: npm install\n/);
});

test("pnpm is set up before node, with a version only when package.json doesn't pin one", () => {
  const unpinned = steps(workflowYaml(project({ pm: "pnpm", lockfile: "pnpm-lock.yaml", pnpmVersion: 10 }), "validate"));
  assert.match(unpinned, /uses: pnpm\/action-setup@v6\n {8}with:\n {10}version: 10\n {6}- uses: actions\/setup-node@v7/);
  assert.match(unpinned, /cache: pnpm/);
  assert.match(unpinned, /- run: pnpm install --frozen-lockfile\n {6}- run: pnpm run validate/);

  const pinned = steps(workflowYaml(project({ pm: "pnpm", lockfile: "pnpm-lock.yaml", pnpmPinned: true }), "validate"));
  assert.match(pinned, /uses: pnpm\/action-setup@v6\n {6}- uses/);
});

test("yarn classic and yarn berry install with their own frozen-lockfile flag", () => {
  const classic = steps(workflowYaml(project({ pm: "yarn", lockfile: "yarn.lock" }), "validate"));
  assert.doesNotMatch(classic, /corepack/);
  assert.match(classic, /yarn install --frozen-lockfile/);

  const berry = steps(workflowYaml(project({ pm: "yarn", lockfile: "yarn.lock", yarnBerry: true }), "validate"));
  assert.match(berry, /- run: corepack enable\n {6}- uses: actions\/setup-node@v7/);
  assert.match(berry, /yarn install --immutable\n {6}- run: yarn run validate/);
});

test("bun gets its own setup step and node for the CLI, without a node package cache", () => {
  const bun = steps(workflowYaml(project({ pm: "bun", lockfile: "bun.lock" }), "astralis:validate"));
  assert.match(bun, /uses: oven-sh\/setup-bun@v2\n {6}- uses: actions\/setup-node@v7/);
  assert.doesNotMatch(bun, /cache:/);
  assert.match(bun, /bun install --frozen-lockfile\n {6}- run: bun run astralis:validate/);
});

test("a project in a subfolder of the repository runs there and caches its own lockfile", () => {
  const yaml = workflowYaml(project({ pm: "pnpm", lockfile: "pnpm-lock.yaml", subdir: "apps/web", pnpmPinned: true }), "validate");
  assert.match(yaml, /defaults:\n {6}run:\n {8}working-directory: apps\/web\n/);
  assert.match(yaml, /package_json_file: apps\/web\/package.json/);
  assert.match(yaml, /cache-dependency-path: apps\/web\/pnpm-lock.yaml/);
});

test("the workflow names the check it asks the user to require, and runs on pull requests", () => {
  const yaml = workflowYaml(project(), "validate");
  assert.match(yaml, /^name: Astralis validate$/m);
  assert.match(yaml, /^ {4}name: Astralis validate$/m);
  assert.match(yaml, /^on:\n {2}pull_request:\n/m);
  assert.match(yaml, /^permissions:\n {2}contents: read$/m);
  assert.doesNotMatch(yaml, /\t/);
});

test("inspectProject reads the lockfile, the git root and yarn berry from disk", () => {
  const repo = tempProject({
    ".git/HEAD": "ref: refs/heads/main\n",
    "web/package.json": { name: "web" },
    "web/yarn.lock": "",
    "web/.yarnrc.yml": "nodeLinker: node-modules\n",
  });
  try {
    const found = inspectProject(join(repo.dir, "web"), { name: "web" }, "yarn");
    assert.equal(found.lockfile, "yarn.lock");
    assert.equal(found.gitRoot, repo.dir);
    assert.equal(found.subdir, "web");
    assert.equal(found.yarnBerry, true);
    const pinned = inspectProject(join(repo.dir, "web"), { packageManager: "yarn@1.22.22" }, "yarn");
    assert.equal(pinned.yarnBerry, true, ".yarnrc.yml alone marks berry");
  } finally {
    repo.cleanup();
  }
});

test("withScript keeps the file's indentation, line endings and final newline", () => {
  const tabs = '{\n\t"name": "x",\n\t"scripts": {\n\t\t"dev": "next dev"\n\t}\n}\n';
  assert.equal(
    withScript(tabs, "validate", "astralis validate"),
    '{\n\t"name": "x",\n\t"scripts": {\n\t\t"dev": "next dev",\n\t\t"validate": "astralis validate"\n\t}\n}\n',
  );
  const crlf = '{\r\n    "name": "x"\r\n}';
  assert.equal(withScript(crlf, "validate", "astralis validate"), '{\r\n    "name": "x",\r\n    "scripts": {\r\n        "validate": "astralis validate"\r\n    }\r\n}');
});

test("annotations escape what GitHub's command syntax reserves", () => {
  const line = annotation(
    "error",
    { code: "invalid-recipe-value", file: "src/a,b:c.tsx", line: 3, column: 7, message: 'Button: "50%" is not\na variant' },
    { cwd: "/repo", workspace: "/repo" },
  );
  assert.equal(
    line,
    "::error file=src/a%2Cb%3Ac.tsx,line=3,col=7,title=astralis invalid-recipe-value::Button: \"50%25\" is not%0Aa variant",
  );
  const warning = annotation("warning", { code: "off-token-color", file: "a.tsx", line: 1, column: 1, message: "m" }, { cwd: "/r", workspace: "/r" });
  assert.match(warning, /^::warning file=a\.tsx,/);
});

test("annotation paths are relative to the repository, not the working directory", () => {
  assert.equal(repositoryPath("src/page.tsx", { cwd: "/repo/apps/web", workspace: "/repo" }), "apps/web/src/page.tsx");
  assert.equal(repositoryPath("src/page.tsx", { cwd: "/repo", workspace: undefined }), "src/page.tsx");
});
