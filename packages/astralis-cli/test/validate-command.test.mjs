import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { tempProject, runCli } from "./helpers.mjs";

/* `astralis validate` as a user runs it: files on disk, exit codes, the JSON report. */

const SPEC = fileURLToPath(import.meta.resolve("astralis-ui/system-spec.json"));

const CLEAN = `import { Button } from "astralis-ui";
export const A = () => <Button variant="solid">Go</Button>;
`;
const BROKEN = `import { Button, Buton } from "astralis-ui";
export const B = () => <Button variant="primary">Go</Button>;
`;

test("clean files exit 0 with a one-line summary", async () => {
  const project = tempProject({ "src/a.tsx": CLEAN, "node_modules/x/skip.tsx": BROKEN });
  try {
    const result = await runCli(["validate", "--spec", SPEC], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.match(result.stdout, /1 file\(s\) against astralis-ui@\S+ — 0 errors, 0 warnings/);
  } finally {
    project.cleanup();
  }
});

test("errors exit 1 and name the file, position and code", async () => {
  const project = tempProject({ "src/a.tsx": CLEAN, "src/b.tsx": BROKEN });
  try {
    const result = await runCli(["validate", "src", "--spec", SPEC], { cwd: project.dir });
    assert.equal(result.code, 1);
    assert.match(result.stdout, /b\.tsx/);
    assert.match(result.stdout, /1:\d+ +✗ .*"Buton" is not exported by astralis-ui.*unknown-import/);
    assert.match(result.stdout, /invalid-recipe-value/);
    assert.match(result.stderr, /2 file\(s\) against .* 2 error\(s\)/);
  } finally {
    project.cleanup();
  }
});

test("--json prints one report with the documented shape", async () => {
  const project = tempProject({ "b.tsx": BROKEN });
  try {
    const result = await runCli(["validate", "b.tsx", "--json", "--spec", SPEC], { cwd: project.dir });
    assert.equal(result.code, 1);
    const report = JSON.parse(result.stdout);
    assert.deepEqual(Object.keys(report), ["spec", "files", "errors", "warnings", "results"]);
    assert.deepEqual(Object.keys(report.spec), ["name", "version", "specVersion"]);
    assert.equal(report.files, 1);
    assert.equal(report.errors, 2);
    const [file] = report.results;
    assert.equal(file.file, "b.tsx");
    for (const finding of file.errors) {
      assert.deepEqual(Object.keys(finding), ["code", "file", "line", "column", "message"]);
    }
  } finally {
    project.cleanup();
  }
});

test("--strict-tokens adds raw-colour warnings without failing the run", async () => {
  const source = `import { Box } from "astralis-ui";\nexport const C = () => <Box bg="#ff0000" />;\n`;
  const project = tempProject({ "c.tsx": source });
  try {
    const plain = JSON.parse((await runCli(["validate", "--json", "--spec", SPEC], { cwd: project.dir })).stdout);
    const strict = await runCli(["validate", "--json", "--strict-tokens", "--spec", SPEC], { cwd: project.dir });
    assert.equal(strict.code, 0);
    const report = JSON.parse(strict.stdout);
    assert.equal(report.warnings, plain.warnings + 1);
    assert.equal(report.results[0].warnings.at(-1).code, "off-token-color");
  } finally {
    project.cleanup();
  }
});

test("no .tsx files, or a path that doesn't exist, is an error", async () => {
  const project = tempProject({ "readme.md": "# x" });
  try {
    const none = await runCli(["validate", "--spec", SPEC], { cwd: project.dir });
    assert.equal(none.code, 1);
    assert.match(none.stderr, /No \.tsx\/\.jsx files/);
    const missing = await runCli(["validate", "nope", "--spec", SPEC], { cwd: project.dir });
    assert.match(missing.stderr, /No such path/);
  } finally {
    project.cleanup();
  }
});
