import { test } from "node:test";
import assert from "node:assert/strict";
import { invokingPackageManager, buildScaffoldCommand } from "../src/commands/create.mjs";

test("invoking package manager comes from the npm user agent", () => {
  assert.equal(invokingPackageManager("pnpm/10.28.0 npm/? node/v24"), "pnpm");
  assert.equal(invokingPackageManager("npm/11.0.0 node/v24"), "npm");
  assert.equal(invokingPackageManager("bun/1.2.0"), "bun");
  assert.equal(invokingPackageManager(""), "npm");
});

test("scaffold command targets the official creators with args forwarded", () => {
  assert.equal(
    buildScaffoldCommand("next", "my-app", [], "npm"),
    "npm create next-app@latest my-app",
  );
  assert.equal(
    buildScaffoldCommand("vite", "my-app", ["--template", "react-ts"], "pnpm"),
    "pnpm create vite@latest my-app --template react-ts --no-immediate",
  );
});

test("npm gets a -- separator before forwarded scaffolder flags", () => {
  assert.equal(
    buildScaffoldCommand("vite", "my-app", ["--template", "react"], "npm"),
    "npm create vite@latest my-app -- --template react --no-immediate",
  );
});

/*
 * create-vite's "install and start now" runs a dev server that never exits, so
 * the wiring step behind it would never run — the user gets a plain Vite app
 * with no Astralis. Opting out is what makes `create` finish what it started.
 */
test("vite is told not to install-and-start, so wiring can run afterwards", () => {
  assert.equal(
    buildScaffoldCommand("vite", "my-app", [], "npm"),
    "npm create vite@latest my-app -- --template react-ts --no-immediate",
  );
  // Next's scaffolder installs but never starts a server, so it needs nothing.
  assert.equal(buildScaffoldCommand("next", "my-app", [], "npm"), "npm create next-app@latest my-app");
});

test("an explicit immediate flag is left alone", () => {
  for (const flag of ["-i", "--immediate", "--no-immediate"]) {
    const command = buildScaffoldCommand("vite", "my-app", [flag], "pnpm");
    assert.equal(command, `pnpm create vite@latest my-app ${flag} --template react-ts`);
  }
});

/*
 * Astralis is a React library, so the Vite path is pinned to a React template.
 * Left open, create-vite's menu offers Vue, Svelte and the rest, and picking
 * one scaffolds a project the library cannot be used in — the failure only
 * showing up two steps later when wiring finds no React.
 */
test("vite always names a React template so the framework menu never appears", () => {
  assert.match(buildScaffoldCommand("vite", "my-app", [], "pnpm"), /--template react-ts/);
  assert.doesNotMatch(buildScaffoldCommand("next", "my-app", [], "pnpm"), /--template/);
});

/*
 * Naming the template also skips create-vite's TypeScript/JavaScript question,
 * so the CLI asks it instead and passes the answer through. Without this,
 * picking JavaScript was impossible — the scaffold silently went TypeScript.
 */
test("the chosen language reaches the scaffolder", () => {
  assert.match(buildScaffoldCommand("vite", "app", [], "pnpm", "react"), /--template react\b/);
  assert.match(buildScaffoldCommand("vite", "app", [], "pnpm", "react-ts"), /--template react-ts\b/);
  // Next asks its own TypeScript question, so the language never applies there.
  assert.doesNotMatch(buildScaffoldCommand("next", "app", [], "pnpm", "react"), /--template/);
});

test("a caller's own template wins — JS and the compiler templates stay reachable", () => {
  for (const own of [
    ["--template", "react"],
    ["-t", "react-compiler-ts"],
  ]) {
    const command = buildScaffoldCommand("vite", "my-app", own, "pnpm");
    assert.equal(command, `pnpm create vite@latest my-app ${own.join(" ")} --no-immediate`);
    // Exactly one template flag — ours must not be appended alongside theirs.
    assert.equal(command.match(/(--template|-t)\s/g).length, 1);
  }
});

test("yarn gets no @latest tag", () => {
  assert.equal(buildScaffoldCommand("next", "app", [], "yarn"), "yarn create next-app app");
});
