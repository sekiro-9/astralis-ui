import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parses } from "../src/lib/edits.mjs";
import { DOCS, createGuide, formatGuide } from "../src/lib/manual.mjs";
import { newEntrySource } from "../src/lib/wiring.mjs";
import { tempProject, runCli, fakeBin, pathWith } from "./helpers.mjs";

/* What each command does when it can't find, read, edit or write a file. */

const LAYOUT = `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
/** A layout init declines: no literal <body>, and {children} twice. */
const ODD_LAYOUT = `import { Shell } from "./shell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <Shell mobile={children}>{children}<aside>{children}</aside></Shell>;
}
`;
const MAIN = `import { createRoot } from "react-dom/client";
import "astralis-ui/styles.css";
import App from "./App";

createRoot(root).render(<App />);
`;
const VITE_CONFIG = 'import { defineConfig } from "vite";\nexport default defineConfig({ plugins: [] });\n';

const nextPkg = {
  name: "x",
  dependencies: { next: "16", react: "19", "astralis-ui": "*" },
  devDependencies: { "astralis-cli": "*", "astralis-devtools": "*" },
};
const vitePkg = {
  name: "x",
  dependencies: { react: "19", "astralis-ui": "*" },
  devDependencies: { vite: "7", "astralis-cli": "*", "astralis-devtools": "*" },
};
const nextProject = (files = {}, pkg = {}) => tempProject({ ".git/HEAD": "", "package.json": { ...nextPkg, ...pkg }, "package-lock.json": "{}", ...files });
const viteProject = (files = {}, pkg = {}) => tempProject({ ".git/HEAD": "", "package.json": { ...vitePkg, ...pkg }, "package-lock.json": "{}", ...files });
const read = (dir, path) => readFileSync(join(dir, path), "utf8");

/** Root ignores file modes, so a read-only file isn't one to it. */
const asRoot = { skip: process.getuid?.() === 0 && "root can write read-only files" };

async function withProject(project, fn) {
  try {
    return await fn(project.dir);
  } finally {
    project.cleanup();
  }
}

/** Every guide says why, what, how to check and where to read more. */
function assertGuide(output, { reason, file, docs }) {
  assert.match(output, reason);
  assert.match(output, /Manual setup:\n {4}1\. /);
  assert.ok(output.includes(file), `names ${file}:\n${output}`);
  assert.match(output, /Check it worked: /);
  assert.ok(output.includes(`Full guide: ${docs}`), `links ${docs}:\n${output}`);
}

test("every docs link a fallback prints lands on a heading that exists", () => {
  const slug = (heading) => heading.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/ /g, "-");
  for (const url of Object.values(DOCS)) {
    const [, page, anchor] = /\/docs\/([a-z-]+)#(.+)$/.exec(url);
    const mdx = readFileSync(fileURLToPath(new URL(`../../astralis-docs/src/app/docs/${page}/page.mdx`, import.meta.url)), "utf8");
    const headings = [...mdx.replace(/```[\s\S]*?```/g, "").matchAll(/^#{2,3} (.+)$/gm)].map((m) => slug(m[1].trim()));
    assert.ok(headings.includes(anchor), `${url} (headings: ${headings.join(", ")})`);
  }
});

test("a guide numbers its steps and indents their code", () => {
  const guide = createGuide({ title: "T", docs: "D", check: "C" }).because("why").step("Open a:", "one\n\ntwo").step("Then b.");
  assert.equal(
    formatGuide(guide),
    "T:\n    - why\n\n  Manual setup:\n    1. Open a:\n         one\n\n         two\n    2. Then b.\n\n  Check it worked: C\n  Full guide: D",
  );
});

test("the entry files a guide offers to create parse", () => {
  for (const [kind, file] of [["next", "app/layout.tsx"], ["next", "app/layout.js"], ["nextPages", "pages/_app.tsx"], ["nextPages", "pages/_app.js"], ["vite", "src/main.tsx"], ["vite", "src/main.jsx"]]) {
    assert.ok(parses(newEntrySource(kind, file)), `${kind} ${file}`);
  }
});

test("init: no framework in a React project still sets up CI and prints the rest", () =>
  withProject(tempProject({ ".git/HEAD": "", "package.json": { name: "x", dependencies: { react: "19" }, devDependencies: { "astralis-cli": "*" } }, "package-lock.json": "{}" }), async (dir) => {
    const result = await runCli(["init", "--ci", "--devtools"], { cwd: dir });
    assert.equal(result.code, 0, result.output);
    assertGuide(result.stdout, { reason: /Couldn't detect Next\.js or a React \+ Vite/, file: "src/main.tsx", docs: DOCS.byHand });
    assertGuide(result.stdout, { reason: /The DevTools aren't fully set up/, file: "vite.config.ts", docs: DOCS.devtools });
    assert.match(result.stdout, /npm add astralis-ui/);
    assert.ok(existsSync(join(dir, ".github/workflows/astralis-validate.yml")));
  }));

test("init: package.json that isn't JSON fails with the reason, not as missing", () =>
  withProject(tempProject({ "package.json": "{ nope" }), async (dir) => {
    const result = await runCli(["init"], { cwd: dir });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /package\.json couldn't be read:\n {4}- it isn't valid JSON/);
    assert.doesNotMatch(result.output, /Unexpected error/);
  }));

test("init: a Next.js layout it can't edit gets what is certain, and steps for the rest only", () =>
  withProject(nextProject({ "app/layout.tsx": ODD_LAYOUT }), async (dir) => {
    const result = await runCli(["init", "--devtools"], { cwd: dir });
    assert.equal(result.code, 0, result.output);
    const layout = read(dir, "app/layout.tsx");
    assert.ok(parses(layout));
    assert.match(layout, /import "astralis-ui\/styles\.css";/);
    assert.doesNotMatch(layout, /astralisThemeInit|AstralisDevTools/, "no const or import without the element that uses it");
    assertGuide(result.stdout, { reason: /the provider, in app\/layout\.tsx: \{children\} appears 3 times/, file: "app/layout.tsx", docs: DOCS.next });
    assertGuide(result.stdout, { reason: /<\/body> not found unambiguously/, file: "app/layout.tsx", docs: DOCS.devtools });
    assert.doesNotMatch(result.stdout, /add these after its other imports/, "the imports are in already");
    assert.ok(existsSync(join(dir, "app/api/astralis-devtools/[...path]/route.ts")));
    assert.doesNotMatch(result.stdout, /Done\./);
  }));

test("init: an entry that doesn't parse claims no edit it didn't make", () =>
  withProject(nextProject({ "app/layout.tsx": `${LAYOUT}\nconst x = {` }), async (dir) => {
    const result = await runCli(["init"], { cwd: dir });
    assert.equal(result.code, 0, result.output);
    assert.doesNotMatch(result.stdout, /✓ provider wrapped/);
    assertGuide(result.stdout, { reason: /app\/layout\.tsx doesn't parse/, file: "app/layout.tsx", docs: DOCS.next });
  }));

test("init: no entry file names the likeliest one for the project's shape", async () => {
  const cases = [
    [nextProject(), "Create app/layout.tsx", DOCS.next],
    [nextProject({ "src/x.ts": "" }), "Create src/app/layout.tsx", DOCS.next],
    [nextProject({ "app/[locale]/layout.tsx": LAYOUT }), "Open app/[locale]/layout.tsx", DOCS.next],
    [nextProject({ "pages/_app.jsx": "" }), "Open pages/_app.jsx", DOCS.nextPages],
    [viteProject(), "Create src/main.tsx", DOCS.vite],
    [viteProject({ "index.html": '<script type="module" src="/src/client.tsx"></script>', "src/client.tsx": "" }), "Open src/client.tsx", DOCS.vite],
  ];
  for (const [project, file, docs] of cases) {
    await withProject(project, async (dir) => {
      const result = await runCli(["init"], { cwd: dir });
      assert.equal(result.code, 0, result.output);
      assertGuide(result.stdout, { reason: /Couldn't find your/, file, docs });
    });
  }
});

test("init --devtools without a root layout still writes the route into the app folder", () =>
  withProject(nextProject({ "src/app/(site)/layout.jsx": LAYOUT }), async (dir) => {
    const result = await runCli(["init", "--devtools"], { cwd: dir });
    assert.equal(result.code, 0, result.output);
    assert.ok(existsSync(join(dir, "src/app/api/astralis-devtools/[...path]/route.js")));
    assertGuide(result.stdout, { reason: /no root layout was found/, file: "src/app/(site)/layout.jsx", docs: DOCS.devtools });
  }));

test("init: a read-only entry is reported with every step, and the rest is still done", asRoot, () =>
  withProject(nextProject({ "app/layout.tsx": LAYOUT }), async (dir) => {
    const layout = join(dir, "app/layout.tsx");
    chmodSync(layout, 0o444);
    const dry = await runCli(["init", "--dry-run"], { cwd: dir });
    assert.match(dry.stdout, /app\/layout\.tsx couldn't be written/);
    const result = await runCli(["init", "--devtools", "--ci"], { cwd: dir });
    chmodSync(layout, 0o644);
    assert.equal(result.code, 1, result.output);
    assert.equal(read(dir, "app/layout.tsx"), LAYOUT);
    assertGuide(result.stdout, { reason: /app\/layout\.tsx couldn't be written: it is read-only/, file: "app/layout.tsx", docs: DOCS.next });
    assertGuide(result.stdout, { reason: /The DevTools aren't fully set up/, file: "<AstralisDevTools />", docs: DOCS.devtools });
    assert.match(result.stdout, /run it again: npx astralis-cli init --devtools --ci/);
    assert.doesNotMatch(result.stdout, /✓ imports added|✓ provider wrapped|Done\./);
    assert.ok(existsSync(join(dir, "app/api/astralis-devtools/[...path]/route.ts")));
    assert.ok(existsSync(join(dir, ".github/workflows/astralis-validate.yml")));
  }));

test("init: an entry that can't be read is reported, not a crash", () =>
  withProject(viteProject(), async (dir) => {
    mkdirSync(join(dir, "src/main.tsx"), { recursive: true });
    const result = await runCli(["init"], { cwd: dir });
    assert.equal(result.code, 1);
    assertGuide(result.stdout, { reason: /src\/main\.tsx couldn't be read: it is a folder, not a file \(EISDIR\)/, file: "src/main.tsx", docs: DOCS.vite });
    assert.doesNotMatch(result.output, /Unexpected error/);
  }));

test("a failed install prints the exact command and everything else is still wired", () =>
  withProject(nextProject({ "app/layout.tsx": LAYOUT }, { dependencies: { next: "16", react: "19" }, devDependencies: {} }), async (dir) => {
    fakeBin(join(dir, "bin"), "npm", "process.exit(7);\n");
    const result = await runCli(["init", "--devtools", "--ci"], { cwd: dir, env: pathWith(join(dir, "bin")) });
    assert.equal(result.code, 1, result.output);
    for (const command of ["npm add astralis-ui", "npm add -D astralis-devtools", "npm add -D astralis-cli"]) {
      assert.match(result.stdout, new RegExp(`^ {9}${command}$`, "m"));
    }
    assert.match(result.stdout, /astralis-ui wasn't installed: it exited with code 7/);
    assert.match(read(dir, "app/layout.tsx"), /<AstralisProvider[\s\S]*<AstralisDevTools \/>/);
    assert.equal(JSON.parse(read(dir, "package.json")).scripts.validate, "astralis validate");
    assert.ok(existsSync(join(dir, ".github/workflows/astralis-validate.yml")));
  }));

test("--dry-run with fallbacks writes nothing", () =>
  withProject(nextProject({ "app/layout.tsx": ODD_LAYOUT }), async (dir) => {
    const before = read(dir, "package.json");
    const result = await runCli(["init", "--devtools", "--ci", "--dry-run"], { cwd: dir });
    assert.equal(result.code, 0, result.output);
    assert.equal(read(dir, "app/layout.tsx"), ODD_LAYOUT);
    assert.equal(read(dir, "package.json"), before);
    assert.equal(existsSync(join(dir, ".github")), false);
    assert.equal(existsSync(join(dir, "app/api")), false);
  }));

test("init --devtools: a missing, odd or read-only vite.config gets the plugin steps", asRoot, async () => {
  const cases = [
    [{}, /no vite\.config was found/, "Create vite.config.ts", 0],
    [{ "vite.config.js": "export default {};\n" }, /no single `plugins/, "Open vite.config.js", 0],
    [{ "vite.config.ts": VITE_CONFIG }, /vite\.config\.ts couldn't be written/, "Open vite.config.ts", 1],
  ];
  for (const [files, reason, file, code] of cases) {
    await withProject(viteProject({ "src/main.tsx": MAIN, ...files }), async (dir) => {
      if (code) chmodSync(join(dir, "vite.config.ts"), 0o444);
      const result = await runCli(["init", "--devtools"], { cwd: dir });
      if (code) chmodSync(join(dir, "vite.config.ts"), 0o644);
      assert.equal(result.code, code, result.output);
      assertGuide(result.stdout, { reason, file, docs: DOCS.devtools });
      assert.match(result.stdout, /plugins: \[react\(\), astralisDevtools\(\)\]/);
      assert.match(read(dir, "src/main.tsx"), /<AstralisProvider/);
    });
  }
});

test("init --devtools: a route path that can't be written is reported", () =>
  withProject(nextProject({ "app/layout.tsx": LAYOUT, "app/api": "in the way" }), async (dir) => {
    const result = await runCli(["init", "--devtools"], { cwd: dir });
    assert.equal(result.code, 1, result.output);
    assertGuide(result.stdout, { reason: /route\.ts couldn't be written/, file: "Create app/api/astralis-devtools/[...path]/route.ts", docs: DOCS.devtools });
  }));

test("init --ci outside a git repository writes the workflow and says how to make one", () =>
  withProject(tempProject({ "package.json": nextPkg, "package-lock.json": "{}", "app/layout.tsx": LAYOUT }), async (dir) => {
    const result = await runCli(["init", "--ci"], { cwd: dir });
    assert.equal(result.code, 0, result.output);
    assert.ok(existsSync(join(dir, ".github/workflows/astralis-validate.yml")));
    assertGuide(result.stdout, { reason: /isn't in a git repository/, file: "git init -b main", docs: DOCS.ci });
  }));

test("init --ci: a workflow folder that can't be made prints the workflow to paste", () =>
  withProject(nextProject({ "app/layout.tsx": LAYOUT, ".github": "a file" }), async (dir) => {
    const result = await runCli(["init", "--ci"], { cwd: dir });
    assert.equal(result.code, 1, result.output);
    assertGuide(result.stdout, { reason: /astralis-validate\.yml couldn't be written/, file: ".github/workflows/astralis-validate.yml with:", docs: DOCS.ci });
    assert.match(result.stdout, /^ {9}name: Astralis validate$/m);
    assert.equal(JSON.parse(read(dir, "package.json")).scripts.validate, "astralis validate");
  }));

test("init --ci: a read-only package.json prints the script to add", asRoot, () =>
  withProject(nextProject({ "app/layout.tsx": LAYOUT }), async (dir) => {
    chmodSync(join(dir, "package.json"), 0o444);
    const result = await runCli(["init", "--ci"], { cwd: dir });
    chmodSync(join(dir, "package.json"), 0o644);
    assert.equal(result.code, 1, result.output);
    assertGuide(result.stdout, { reason: /package\.json couldn't be written/, file: '"validate": "astralis validate"', docs: DOCS.ci });
    assert.ok(existsSync(join(dir, ".github/workflows/astralis-validate.yml")));
  }));

test("init --ci: with both script names taken, following the step and running it again works", () =>
  withProject(nextProject({ "app/layout.tsx": LAYOUT }, { scripts: { validate: "tsc", "astralis:validate": "echo" } }), async (dir) => {
    const result = await runCli(["init", "--ci"], { cwd: dir });
    assert.equal(result.code, 0, result.output);
    assertGuide(result.stdout, { reason: /both do something else/, file: '"validate": "tsc && astralis validate"', docs: DOCS.ci });
    const pkg = JSON.parse(read(dir, "package.json"));
    pkg.scripts.validate = "tsc && astralis validate";
    writeFileSync(join(dir, "package.json"), JSON.stringify(pkg));
    await runCli(["init", "--ci"], { cwd: dir });
    assert.ok(existsSync(join(dir, ".github/workflows/astralis-validate.yml")));
  }));

test("theme: no entry, an odd entry or a read-only one prints where the import goes", asRoot, async () => {
  const cases = [
    [{}, /No Next\.js or Vite entry point/, "Open src/main.tsx"],
    [{ "src/main.tsx": "import {" }, /src\/main\.tsx: the file doesn't parse/, "Open src/main.tsx"],
    [{ "src/main.tsx": MAIN }, /src\/main\.tsx couldn't be written/, "Open src/main.tsx", true],
  ];
  for (const [files, reason, file, readOnly] of cases) {
    await withProject(viteProject({ "src/x.ts": "", ...files }), async (dir) => {
      if (readOnly) chmodSync(join(dir, "src/main.tsx"), 0o444);
      const result = await runCli(["theme", "#8b5cf6"], { cwd: dir });
      if (readOnly) chmodSync(join(dir, "src/main.tsx"), 0o644);
      assert.equal(result.code, 0, result.output);
      assertGuide(result.stdout, { reason, file, docs: DOCS.theme });
      assert.match(result.stdout, /import "astralis-ui\/styles\.css";\n {9}import "\.\/astralis-theme\.css";/);
      assert.match(result.stdout, /--astralis-color-brand-500 is #8b5cf6/);
      assert.ok(existsSync(join(dir, "src/astralis-theme.css")));
    });
  }
});

test("theme: a stylesheet that can't be written fails with the command to run again", () =>
  withProject(viteProject({ "src/main.tsx": MAIN, styles: "a file" }), async (dir) => {
    const result = await runCli(["theme", "#8b5cf6", "--out", "styles/theme.css"], { cwd: dir });
    assert.equal(result.code, 1, result.output);
    assertGuide(result.stderr, { reason: /styles\/theme\.css couldn't be written/, file: 'npx astralis-cli theme "#8b5cf6" --out styles/theme.css', docs: DOCS.theme });
    assert.equal(read(dir, "src/main.tsx"), MAIN);
  }));

test("theme: a project copy of astralis-ui that won't load falls back to the bundled one", () =>
  withProject(viteProject({ "src/main.tsx": MAIN, "node_modules/astralis-ui/package.json": "{" }), async (dir) => {
    const result = await runCli(["theme", "#8b5cf6"], { cwd: dir });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /couldn't be loaded .*using the CLI's own copy/);
  }));

/* create, with the scaffolder and the installs played by a fake npm. */
const scaffolder = (files) => `import { mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { dirname, join } from "node:path";
const args = process.argv.slice(2);
if (args[0] === "create") {
  for (const [path, content] of Object.entries(${JSON.stringify(files)})) {
    mkdirSync(dirname(join("app1", path)), { recursive: true });
    writeFileSync(join("app1", path), content);
  }
  if (process.env.FAKE_READONLY) chmodSync(join("app1", process.env.FAKE_READONLY), 0o444);
}
process.exit(Number(process.env[args[0] === "create" ? "FAKE_CREATE" : "FAKE_ADD"] ?? 0));
`;
const SCAFFOLD = {
  "package.json": JSON.stringify({ name: "app1", dependencies: { react: "19" }, devDependencies: { vite: "7" } }),
  "src/main.tsx": MAIN,
  "src/App.tsx": "export default () => null;\n",
  "src/index.css": "#root { text-align: center }\n",
  "vite.config.ts": VITE_CONFIG,
};

async function create(files, env, fn) {
  await withProject(tempProject(), async (dir) => {
    fakeBin(join(dir, "bin"), "npm", scaffolder(files));
    const result = await runCli(["create", "app1", "--framework", "vite", "--yes"], { cwd: dir, env: { ...pathWith(join(dir, "bin")), ...env } });
    await fn(result, join(dir, "app1"));
    if (env.FAKE_READONLY) chmodSync(join(dir, "app1", env.FAKE_READONLY), 0o644);
  });
}

test("create: scaffolding that fails prints both halves to run by hand", () =>
  create(SCAFFOLD, { FAKE_CREATE: "3" }, (result) => {
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Scaffolding failed or was cancelled[\s\S]*it exited with code 3/);
    assert.match(result.stderr, /1\. Delete \.\/app1 [\s\S]*npm create vite@latest app1 -- [\s\S]*2\. Wire Astralis in:\n {9}cd app1\n {9}npx astralis-cli init --devtools/);
    assert.ok(result.stderr.includes(DOCS.create));
  }));

test("create: failed installs still leave a wired project, its welcome screen and the next steps", () =>
  create(SCAFFOLD, { FAKE_ADD: "9" }, (result, dir) => {
    assert.equal(result.code, 1, result.output);
    assert.match(result.stdout, /^ {9}npm add astralis-ui$/m);
    assert.match(read(dir, "src/main.tsx"), /<AstralisProvider/);
    assert.match(read(dir, "src/App.tsx"), /AstralisLogo/);
    assert.match(result.stdout, /Next steps:/);
  }));

test("create: a page that can't be written keeps the demo and prints a first page", asRoot, () =>
  create(SCAFFOLD, { FAKE_READONLY: "src/App.tsx" }, (result) => {
    assert.equal(result.code, 1, result.output);
    assertGuide(result.stdout, { reason: /src\/App\.tsx couldn't be written/, file: "Open src/App.tsx", docs: DOCS.create });
    assert.match(result.stdout, /Next steps:/);
  }));

test("create: a project without an entry keeps its demo page and says so", () => {
  const { "src/main.tsx": _, ...files } = SCAFFOLD;
  return create(files, {}, (result, dir) => {
    assert.equal(result.code, 0, result.output);
    assertGuide(result.stdout, { reason: /entry file wasn't found, so the scaffolder's demo page was kept/, file: "Open src/App.tsx", docs: DOCS.create });
    assert.equal(read(dir, "src/App.tsx"), SCAFFOLD["src/App.tsx"]);
  });
});
