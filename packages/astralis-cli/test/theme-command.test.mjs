import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tempProject, runCli } from "./helpers.mjs";

const MAIN = `import { createRoot } from "react-dom/client";
import "astralis-ui/styles.css";
import App from "./App";

createRoot(root).render(<App />);
`;

/** A stand-in astralis-ui installed in the project, so the test can tell whose code ran. */
const FAKE_LIBRARY = {
  "node_modules/astralis-ui/package.json": {
    name: "astralis-ui",
    version: "9.9.9",
    type: "module",
    exports: {
      "./serialize": { import: "./serialize.js" },
      "./contrast": { import: "./contrast.js" },
      "./styles.css": "./styles.css",
    },
  },
  "node_modules/astralis-ui/serialize.js": `export const themeCss = () => "/* fake astralis-ui 9.9.9 */\\n";
export const validateSeed = () => [];
export const isEmptySeed = (seed) => Object.keys(seed).length === 0;
`,
  "node_modules/astralis-ui/contrast.js": `export const parsePaletteFromCss = () => {
  if (process.env.FAKE_CONTRAST === "throw") throw new Error("palette unreadable");
  return {};
};
export const verifySeedContrast = () =>
  process.env.FAKE_CONTRAST === "fail"
    ? [{ pass: false, mode: "light", rule: "brand-solid text", fgHex: "#ffffff", bgHex: "#eeeeee", ratio: 1.1, min: 4.5 }]
    : [{ pass: true }];
`,
  "node_modules/astralis-ui/styles.css": "",
};

function viteProject(extra = {}) {
  return tempProject({
    "package.json": { name: "x", dependencies: { react: "19", "astralis-ui": "*" }, devDependencies: { vite: "7" } },
    "src/main.tsx": MAIN,
    ...extra,
  });
}

/* CLI-F17: theme used the CLI's bundled astralis-ui, not the project's. */
test("theme renders with the project's own astralis-ui and imports the result", async () => {
  const project = viteProject(FAKE_LIBRARY);
  try {
    const result = await runCli(["theme", "#8b5cf6"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.equal(readFileSync(join(project.dir, "src/astralis-theme.css"), "utf8"), "/* fake astralis-ui 9.9.9 */\n");
    assert.match(result.stdout, /astralis-ui 9\.9\.9, your project's copy/);
    const main = readFileSync(join(project.dir, "src/main.tsx"), "utf8");
    assert.match(main, /import App from "\.\/App";\nimport "\.\/astralis-theme\.css";\n/);
  } finally {
    project.cleanup();
  }
});

test("without a project copy it falls back to the bundled library", async () => {
  const project = viteProject();
  try {
    const result = await runCli(["theme", "#8b5cf6", "--no-import"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.match(readFileSync(join(project.dir, "src/astralis-theme.css"), "utf8"), /--astralis-color-brand-500: #8b5cf6;/);
    assert.match(result.stdout, /the CLI's bundled copy/);
    assert.equal(readFileSync(join(project.dir, "src/main.tsx"), "utf8"), MAIN);
  } finally {
    project.cleanup();
  }
});

/* CLI-F10: the strict failure was swallowed by its own catch, after the CSS was already written. */
test("--strict-contrast fails before writing anything", async () => {
  for (const mode of ["fail", "throw"]) {
    const project = viteProject(FAKE_LIBRARY);
    try {
      const result = await runCli(["theme", "#8b5cf6", "--strict-contrast"], {
        cwd: project.dir,
        env: { FAKE_CONTRAST: mode },
      });
      assert.equal(result.code, 1, `${mode}: ${result.output}`);
      assert.match(result.stderr, /under --strict-contrast/);
      assert.equal(existsSync(join(project.dir, "src/astralis-theme.css")), false, mode);
      assert.equal(readFileSync(join(project.dir, "src/main.tsx"), "utf8"), MAIN, mode);
    } finally {
      project.cleanup();
    }
  }
});

test("without --strict-contrast a failing pairing warns and still writes", async () => {
  const project = viteProject(FAKE_LIBRARY);
  try {
    const result = await runCli(["theme", "#8b5cf6"], { cwd: project.dir, env: { FAKE_CONTRAST: "fail" } });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /1 of 1 pairings fall below WCAG AA/);
    assert.ok(existsSync(join(project.dir, "src/astralis-theme.css")));
  } finally {
    project.cleanup();
  }
});

test("an existing theme file needs --force", async () => {
  const project = viteProject({ ...FAKE_LIBRARY, "src/astralis-theme.css": "/* mine */" });
  try {
    const refused = await runCli(["theme", "#8b5cf6"], { cwd: project.dir });
    assert.equal(refused.code, 1);
    assert.equal(readFileSync(join(project.dir, "src/astralis-theme.css"), "utf8"), "/* mine */");
    const forced = await runCli(["theme", "#8b5cf6", "--force"], { cwd: project.dir });
    assert.equal(forced.code, 0, forced.output);
  } finally {
    project.cleanup();
  }
});

test("bad seed values are rejected with the field that's wrong", async () => {
  const project = viteProject();
  try {
    const result = await runCli(["theme", "--brand", "nope", "--radius", "x"], { cwd: project.dir });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /--radius expects a number/);
  } finally {
    project.cleanup();
  }
});
