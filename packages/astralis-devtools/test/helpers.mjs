import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The monorepo's built spec: the tests judge against the real contract. */
export const SPEC_PATH = fileURLToPath(new URL("../../astralis-ui/dist/system-spec.json", import.meta.url));
export const SPEC_TEXT = readFileSync(SPEC_PATH, "utf8");
export const SPEC = JSON.parse(SPEC_TEXT);

export const VALID_PAGE = `import { Card, Button } from "astralis-ui";
export default function Page() {
  return <Card variant="outline"><Card.Body><Button>Go</Button></Card.Body></Card>;
}
`;

/** A Card variant the spec does not have: one invalid-recipe-value error, at 3:16. */
export const INVALID_PAGE = `import { Card } from "astralis-ui";
export default function Page() {
  return <Card variant="glass">x</Card>;
}
`;

/**
 * A throwaway project with astralis-ui "installed" (its package.json and the
 * real spec under node_modules) plus `files`. Removed by `cleanup`.
 */
export function fixtureProject(files = {}, { installed = true, framework = "next" } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "astralis-devtools-test-"));
  const write = (path, content) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  };
  if (installed) {
    write("node_modules/astralis-ui/package.json", JSON.stringify({ name: "astralis-ui", version: SPEC.version }));
    write("node_modules/astralis-ui/dist/system-spec.json", SPEC_TEXT);
    write(`node_modules/${framework}/package.json`, JSON.stringify({ name: framework, version: "99.1.0" }));
    write("node_modules/react/package.json", JSON.stringify({ name: "react", version: "19.2.0" }));
  }
  for (const [path, content] of Object.entries(files)) write(path, content);
  return { dir, write, remove: (path) => rmSync(join(dir, path), { force: true }), cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/** A watch function the test drives: `watch.emit(path)` reports a change. */
export function manualWatch() {
  let listener = null;
  const watch = (onChange) => {
    listener = onChange;
    return () => {
      listener = null;
    };
  };
  watch.emit = (path) => listener?.(path);
  watch.active = () => listener !== null;
  return watch;
}

/** Resolve once `predicate()` is true, polling; reject after `ms`. */
export async function until(predicate, ms = 2000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > ms) throw new Error("timed out waiting");
    await new Promise((done) => setTimeout(done, 10));
  }
}
