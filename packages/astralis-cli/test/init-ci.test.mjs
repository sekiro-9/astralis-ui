import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempProject, runCli, fakeBin, pathWith } from "./helpers.mjs";

/* `astralis init --ci` against real project shapes. Both packages are already dependencies, so nothing installs. */

const LAYOUT = `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

const WORKFLOW = ".github/workflows/astralis-validate.yml";

const nextProject = (pkg = {}, files = {}) =>
  tempProject({
    ".git/HEAD": "ref: refs/heads/main\n",
    "package.json": {
      name: "x",
      dependencies: { next: "16", react: "19", "astralis-ui": "*" },
      devDependencies: { "astralis-cli": "*" },
      ...pkg,
    },
    "package-lock.json": "{}",
    "app/layout.tsx": LAYOUT,
    ...files,
  });

const read = (dir, path) => readFileSync(join(dir, path), "utf8");

test("init --ci adds the script and the workflow, and tells the user which check to require", async () => {
  const project = nextProject();
  try {
    const result = await runCli(["init", "--ci"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.equal(JSON.parse(read(project.dir, "package.json")).scripts.validate, "astralis validate");
    const workflow = read(project.dir, WORKFLOW);
    assert.match(workflow, /- run: npm ci\n {6}- run: npm run validate\n/);
    assert.match(result.stdout, /wrote \.github\/workflows\/astralis-validate\.yml/);
    assert.match(result.stdout, /make "Astralis validate" a required status check/);
  } finally {
    project.cleanup();
  }
});

test("a second init --ci changes nothing and says so in one line", async () => {
  const project = nextProject();
  try {
    await runCli(["init", "--ci"], { cwd: project.dir });
    const before = [read(project.dir, "package.json"), read(project.dir, WORKFLOW), read(project.dir, "app/layout.tsx")];
    const again = await runCli(["init", "--ci"], { cwd: project.dir });
    assert.equal(again.code, 0, again.output);
    assert.equal(again.stdout.trim().split("\n")[0], "✓ astralis-ui and its CI check are already set up in this project");
    assert.deepEqual([read(project.dir, "package.json"), read(project.dir, WORKFLOW), read(project.dir, "app/layout.tsx")], before);
  } finally {
    project.cleanup();
  }
});

test("an edited workflow is left alone without --force and replaced with it", async () => {
  const project = nextProject();
  try {
    await runCli(["init", "--ci"], { cwd: project.dir });
    writeFileSync(join(project.dir, WORKFLOW), "name: mine\n");
    const kept = await runCli(["init", "--ci"], { cwd: project.dir });
    assert.equal(kept.code, 0);
    assert.match(kept.stdout, /already exists and differs .*\(--force replaces it\)/);
    assert.equal(read(project.dir, WORKFLOW), "name: mine\n");
    assert.doesNotMatch(kept.stdout, /Done\./, "nothing changed, so init must not say it is done");

    const forced = await runCli(["init", "--ci", "--force"], { cwd: project.dir });
    assert.equal(forced.code, 0, forced.output);
    assert.match(forced.stdout, /replaced \.github\/workflows\/astralis-validate\.yml/);
    assert.match(read(project.dir, WORKFLOW), /^name: Astralis validate$/m);
  } finally {
    project.cleanup();
  }
});

test("--dry-run with --ci writes nothing", async () => {
  const project = nextProject();
  try {
    const packageBefore = read(project.dir, "package.json");
    const result = await runCli(["init", "--ci", "--dry-run"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /would write \.github\/workflows\/astralis-validate\.yml/);
    assert.match(result.stdout, /Run astralis init --ci to apply it/);
    assert.equal(existsSync(join(project.dir, WORKFLOW)), false);
    assert.equal(read(project.dir, "package.json"), packageBefore);
  } finally {
    project.cleanup();
  }
});

test("a validate script that does something else is kept, and the workflow runs astralis:validate", async () => {
  const project = nextProject({ scripts: { validate: "tsc --noEmit" } });
  try {
    const result = await runCli(["init", "--ci"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    const scripts = JSON.parse(read(project.dir, "package.json")).scripts;
    assert.equal(scripts.validate, "tsc --noEmit");
    assert.equal(scripts["astralis:validate"], "astralis validate");
    assert.match(read(project.dir, WORKFLOW), /- run: npm run astralis:validate\n/);
  } finally {
    project.cleanup();
  }
});

test("a project in a subfolder gets the workflow at the repository root, running in the subfolder", async () => {
  const repo = tempProject({
    ".git/HEAD": "ref: refs/heads/main\n",
    "apps/web/package.json": {
      name: "web",
      dependencies: { next: "16", react: "19", "astralis-ui": "*" },
      devDependencies: { "astralis-cli": "*" },
    },
    "apps/web/package-lock.json": "{}",
    "apps/web/app/layout.tsx": LAYOUT,
  });
  const web = join(repo.dir, "apps", "web");
  try {
    const result = await runCli(["init", "--ci"], { cwd: web });
    assert.equal(result.code, 0, result.output);
    const workflow = read(repo.dir, WORKFLOW);
    assert.match(workflow, /working-directory: apps\/web/);
    assert.match(workflow, /cache-dependency-path: apps\/web\/package-lock.json/);
    assert.equal(existsSync(join(web, WORKFLOW)), false);
  } finally {
    repo.cleanup();
  }
});

test("init --ci installs astralis-cli as a devDependency when it is missing", async () => {
  const project = nextProject({ devDependencies: {} }, { "pnpm-lock.yaml": "lockfileVersion: '9.0'\n" });
  const bin = join(project.dir, ".fake-bin");
  fakeBin(
    bin,
    "pnpm",
    `import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
appendFileSync(process.env.FAKE_LOG, JSON.stringify(args) + "\\n");
if (args[0] === "--version") { process.stdout.write("10.28.0\\n"); process.exit(0); }
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.devDependencies = { ...pkg.devDependencies, "astralis-cli": "^0.5.0" };
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\\n");
`,
  );
  const log = join(project.dir, "calls.log");
  try {
    const result = await runCli(["init", "--ci"], { cwd: project.dir, env: { ...pathWith(bin), FAKE_LOG: log } });
    assert.equal(result.code, 0, result.output);
    const calls = readFileSync(log, "utf8").trim().split("\n").map((line) => JSON.parse(line));
    assert.deepEqual(calls[0], ["add", "-D", "astralis-cli"]);
    const pkg = JSON.parse(read(project.dir, "package.json"));
    assert.equal(pkg.devDependencies["astralis-cli"], "^0.5.0", "the script edit must not undo the install");
    assert.equal(pkg.scripts.validate, "astralis validate");
    const workflow = read(project.dir, WORKFLOW);
    assert.match(workflow, /pnpm\/action-setup@v6\n {8}with:\n {10}version: 10/);
    assert.match(workflow, /- run: pnpm install --frozen-lockfile\n {6}- run: pnpm run validate/);
  } finally {
    project.cleanup();
  }
});

test("--force without --ci is refused", async () => {
  const project = nextProject();
  try {
    const result = await runCli(["init", "--force"], { cwd: project.dir });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /--force only applies with --ci/);
  } finally {
    project.cleanup();
  }
});
