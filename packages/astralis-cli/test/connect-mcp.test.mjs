import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { backupPath, mcpAddArgs, mcpServerEntry } from "../src/commands/connect-mcp.mjs";
import { tempProject, runCli, fakeBin, pathWith } from "./helpers.mjs";

/** Point every home-directory lookup at `home`, on any platform. */
const homeEnv = (home) => ({ HOME: home, USERPROFILE: home, APPDATA: join(home, "AppData", "Roaming") });

/* CLI-F13: Claude Code and Codex were registered with a bare `npx`, which Windows can't spawn. */
test("mcp add launches the server the way the platform needs", () => {
  assert.deepEqual(mcpAddArgs("win32"), ["mcp", "add", "astralis", "--", "cmd", "/c", "npx", "-y", "astralis-mcp"]);
  assert.deepEqual(mcpAddArgs("linux"), ["mcp", "add", "astralis", "--", "npx", "-y", "astralis-mcp"]);
});

test("a command client gets exactly the mcp add argv", async () => {
  const home = tempProject();
  const bin = join(home.dir, "bin");
  const log = join(home.dir, "claude.log");
  fakeBin(bin, "claude", `import { writeFileSync } from "node:fs";
writeFileSync(process.env.FAKE_LOG, JSON.stringify(process.argv.slice(2)));
`);
  try {
    const result = await runCli(["connect-mcp", "--client", "claude-code", "--yes"], {
      cwd: home.dir,
      env: { ...homeEnv(home.dir), ...pathWith(bin), FAKE_LOG: log },
    });
    assert.equal(result.code, 0, result.output);
    const entry = mcpServerEntry();
    assert.deepEqual(JSON.parse(readFileSync(log, "utf8")), ["mcp", "add", "astralis", "--", entry.command, ...entry.args]);
  } finally {
    home.cleanup();
  }
});

/* CLI-F23: mkdirSync created ~/.cursor for a client that was never installed. */
test("a file client that isn't installed is left alone", async () => {
  const home = tempProject();
  try {
    const result = await runCli(["connect-mcp", "--client", "cursor", "--yes"], { cwd: home.dir, env: homeEnv(home.dir) });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Cursor doesn't look installed/);
    assert.equal(existsSync(join(home.dir, ".cursor")), false);
  } finally {
    home.cleanup();
  }
});

/* CLI-F22: every run overwrote the one .bak, losing the original config. */
test("each write backs up to a fresh file and keeps other servers", async () => {
  const home = tempProject({ ".cursor/mcp.json": { mcpServers: { other: { command: "x" } } } });
  const config = join(home.dir, ".cursor", "mcp.json");
  const run = () => runCli(["connect-mcp", "--client", "cursor", "--yes"], { cwd: home.dir, env: homeEnv(home.dir) });
  try {
    const first = await run();
    assert.equal(first.code, 0, first.output);
    const written = JSON.parse(readFileSync(config, "utf8"));
    assert.deepEqual(Object.keys(written.mcpServers), ["other", "astralis"]);
    assert.deepEqual(written.mcpServers.astralis, mcpServerEntry());
    const original = readFileSync(`${config}.bak`, "utf8");
    assert.deepEqual(JSON.parse(original), { mcpServers: { other: { command: "x" } } });

    // Already configured: nothing to write, nothing to back up.
    const again = await run();
    assert.match(again.stdout, /already has an "astralis" MCP server/);
    assert.equal(existsSync(`${config}.bak.1`), false);

    writeFileSync(config, JSON.stringify({ mcpServers: {} }));
    await run();
    assert.equal(readFileSync(`${config}.bak`, "utf8"), original);
    assert.deepEqual(JSON.parse(readFileSync(`${config}.bak.1`, "utf8")), { mcpServers: {} });
  } finally {
    home.cleanup();
  }
});

test("backupPath never names an existing file", () => {
  const dir = tempProject();
  try {
    const file = join(dir.dir, "c.json");
    assert.equal(backupPath(file), `${file}.bak`);
    writeFileSync(`${file}.bak`, "");
    writeFileSync(`${file}.bak.1`, "");
    assert.equal(backupPath(file), `${file}.bak.2`);
  } finally {
    dir.cleanup();
  }
});

test("a malformed config is reported, not overwritten", async () => {
  const home = tempProject();
  mkdirSync(join(home.dir, ".cursor"));
  writeFileSync(join(home.dir, ".cursor", "mcp.json"), "{ nope");
  try {
    const result = await runCli(["connect-mcp", "--client", "cursor", "--yes"], { cwd: home.dir, env: homeEnv(home.dir) });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /isn't valid JSON/);
    assert.equal(readFileSync(join(home.dir, ".cursor", "mcp.json"), "utf8"), "{ nope");
  } finally {
    home.cleanup();
  }
});
