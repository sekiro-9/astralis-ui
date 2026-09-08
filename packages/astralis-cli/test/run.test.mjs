import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runCommand, quoteForCmd, UnsafeArgumentError } from "../src/lib/run.mjs";
import { tempProject, runCli, fakeBin, pathWith } from "./helpers.mjs";

const ECHO_ARGV = "process.stdout.write(JSON.stringify(process.argv.slice(1)))";

/* CLI-F12: forwarded arguments were joined into one string and run through a shell. */
test("arguments arrive exactly as given: spaces, globs and shell metacharacters", () => {
  const args = ["a b", "@/*", "--import-alias=@/*", "x&y", "p|q", "(p)", "c^d", "semi;colon", "<in>", "", "tail\\"];
  const result = runCommand(process.execPath, ["-e", ECHO_ARGV, ...args], { stdio: "pipe", encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), args);
});

test("cmd.exe quoting leaves plain words alone and refuses what it can't carry", () => {
  assert.equal(quoteForCmd("--template"), "--template");
  assert.equal(quoteForCmd("a b"), '"a b"');
  assert.equal(quoteForCmd("x&y"), '"x&y"');
  assert.equal(quoteForCmd(""), '""');
  assert.equal(quoteForCmd("dir with space\\"), '"dir with space\\\\"');
  for (const unsafe of ['say "hi"', "%PATH%", "a\nb"]) {
    assert.throws(() => quoteForCmd(unsafe), UnsafeArgumentError);
  }
});

/*
 * create end to end, against a fake pnpm: CLI-F11 — the nested init used to
 * detect npm (a fresh scaffold has no lockfile) and write package-lock.json.
 */
test("create scaffolds, then init installs with the package manager that invoked it", async () => {
  const work = tempProject();
  const bin = join(work.dir, "bin");
  const log = join(work.dir, "calls.log");
  fakeBin(
    bin,
    "pnpm",
    `import { writeFileSync, mkdirSync, appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
appendFileSync(process.env.FAKE_LOG, JSON.stringify(args) + "\\n");
if (args[0] === "create") {
  const name = args[2];
  mkdirSync(join(name, "src"), { recursive: true });
  writeFileSync(join(name, "package.json"), JSON.stringify({ name, dependencies: { react: "19" }, devDependencies: { vite: "7" } }));
  writeFileSync(join(name, "src", "main.tsx"), "import { StrictMode } from 'react'\\nimport App from './App.tsx'\\n\\ncreateRoot(root).render(\\n  <StrictMode>\\n    <App />\\n  </StrictMode>,\\n)\\n");
  writeFileSync(join(name, "src", "App.css"), "#root { text-align: center }");
  writeFileSync(join(name, "src", "index.css"), ":root { color: red }");
} else if (args[0] === "add") {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  pkg.dependencies[args[1]] = "*";
  writeFileSync("package.json", JSON.stringify(pkg));
}
`,
  );

  try {
    const result = await runCli(["create", "my-app", "--framework=vite", "--yes"], {
      cwd: work.dir,
      env: { ...pathWith(bin), FAKE_LOG: log, npm_config_user_agent: "pnpm/10.0.0 npm/? node/v24" },
    });
    assert.equal(result.code, 0, result.output);

    const calls = readFileSync(log, "utf8").trim().split("\n").map((line) => JSON.parse(line));
    assert.deepEqual(calls[0], ["create", "vite@latest", "my-app", "--template", "react-ts", "--no-immediate", "--no-interactive"]);
    assert.deepEqual(calls[1], ["add", "astralis-ui"]);

    const app = join(work.dir, "my-app");
    assert.equal(existsSync(join(app, "package-lock.json")), false);
    const main = readFileSync(join(app, "src/main.tsx"), "utf8");
    assert.match(main, /import \{ AstralisProvider \} from 'astralis-ui'/);
    assert.match(main, /<AstralisProvider defaultTheme="system"><App \/><\/AstralisProvider>/);
    assert.match(readFileSync(join(app, "src/App.tsx"), "utf8"), /from "astralis-ui"/);
    assert.equal(existsSync(join(app, "src/App.css")), false);
    assert.match(result.stdout, /pnpm run dev/);
  } finally {
    work.cleanup();
  }
});
