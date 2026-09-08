import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { ok, warn, info, fail, confirm, select, bold, cyan, dim } from "../lib/ui.mjs";
import { parseCommandArgs } from "../lib/args.mjs";
import { commandNamed } from "../lib/commands.mjs";
import { runCommand } from "../lib/run.mjs";

/**
 * Connect one AI coding agent to the astralis-mcp docs server: pick a client,
 * see exactly what will happen, confirm, and it runs the client's own
 * `mcp add` or writes its JSON config (backing the old one up).
 */

/** Windows can't spawn npx directly from a JSON command — it needs the cmd shim. */
export function mcpServerEntry(platform = process.platform) {
  return platform === "win32"
    ? { command: "cmd", args: ["/c", "npx", "-y", "astralis-mcp"] }
    : { command: "npx", args: ["-y", "astralis-mcp"] };
}

export function claudeDesktopConfigPath(platform = process.platform, home = homedir()) {
  if (platform === "win32") return join(process.env.APPDATA ?? join(home, "AppData", "Roaming"), "Claude", "claude_desktop_config.json");
  if (platform === "darwin") return join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  return join(home, ".config", "Claude", "claude_desktop_config.json");
}

export function cursorConfigPath(home = homedir()) {
  return join(home, ".cursor", "mcp.json");
}

/** Antigravity shares one config across IDE and CLI — same path on every platform. */
export function antigravityConfigPath(home = homedir()) {
  return join(home, ".gemini", "config", "mcp_config.json");
}

/**
 * Every supported client, in menu order. "command" clients own their config
 * and we run their `mcp add`; "file" clients get an `mcpServers` entry written
 * into their JSON config. `root` is the directory that exists once the client
 * is installed.
 */
export const CLIENTS = {
  "claude-code": { label: "Claude Code", kind: "command", bin: "claude" },
  codex: { label: "Codex", kind: "command", bin: "codex" },
  cursor: {
    label: "Cursor",
    kind: "file",
    path: cursorConfigPath,
    root: (home = homedir()) => join(home, ".cursor"),
    reload: "Reload Cursor to pick it up.",
  },
  "claude-desktop": {
    label: "Claude Desktop",
    kind: "file",
    path: claudeDesktopConfigPath,
    root: () => dirname(claudeDesktopConfigPath()),
    reload: "Restart Claude Desktop to pick it up.",
  },
  antigravity: {
    label: "Antigravity",
    kind: "file",
    path: antigravityConfigPath,
    root: (home = homedir()) => join(home, ".gemini"),
    reload: "Reload Antigravity to pick it up.",
  },
};

/** The `mcp add` argv for a command client, launching the server the way this platform needs. */
export function mcpAddArgs(platform = process.platform) {
  const entry = mcpServerEntry(platform);
  return ["mcp", "add", "astralis", "--", entry.command, ...entry.args];
}

/**
 * An existing config file's contents. Empty or whitespace-only counts as a
 * fresh config; malformed JSON throws for the caller to report.
 */
export function parseConfigFile(raw) {
  return raw.trim() === "" ? {} : JSON.parse(raw);
}

/** The first of `file.bak`, `file.bak.1`, `file.bak.2`… that doesn't exist yet, so no backup is overwritten. */
export function backupPath(file) {
  if (!existsSync(`${file}.bak`)) return `${file}.bak`;
  for (let n = 1; ; n++) {
    if (!existsSync(`${file}.bak.${n}`)) return `${file}.bak.${n}`;
  }
}

export async function run(argv) {
  const args = parseCommandArgs(commandNamed("connect-mcp"), argv);
  if (!args) return;

  let key = args.values.client;
  if (key === undefined) {
    console.log(`${bold("Connect a client")} to the Astralis MCP docs server.\n`);
    key = await select(
      "Which client do you want to connect?",
      Object.entries(CLIENTS).map(([value, { label }]) => ({ value, label })),
      { hint: `Pass ${cyan("--client <name>")}.` },
    );
    if (key === null) {
      warn("No client selected — nothing to do.");
      return;
    }
  }

  const client = CLIENTS[key];
  if (!client) {
    fail(`Unknown --client "${key}" — expected one of: ${Object.keys(CLIENTS).join(", ")}.`);
  }

  console.log();
  if (client.kind === "command") await connectViaCommand(client);
  else await connectViaFile(client);
}

/** Run the client's own `mcp add` command, falling back to a copy-paste line. */
async function connectViaCommand(client) {
  const addArgs = mcpAddArgs();
  const cmdline = [client.bin, ...addArgs].join(" ");
  info(`${bold(client.label)} manages MCP servers with its own CLI.`);
  console.log(`  I'll run:  ${cyan(cmdline)}`);
  console.log(dim(`  Needs the ${client.bin} CLI on your PATH.`));

  if (!(await confirm("Proceed?"))) {
    warn("Cancelled.");
    return;
  }

  const result = runCommand(client.bin, addArgs);
  if (result.status === 0) {
    ok(`Connected ${client.label} to the Astralis docs server.`);
  } else {
    fail(`That didn't complete (is the ${cyan(client.bin)} CLI installed?). You can run it yourself:\n    ${cyan(cmdline)}`);
  }
}

/** Merge the astralis entry into the client's JSON config, backing up first. */
async function connectViaFile(client) {
  const entry = mcpServerEntry();
  const configPath = client.path();
  const snippet = `"astralis": ${JSON.stringify(entry)}`;

  if (!existsSync(client.root())) {
    fail(
      `${client.label} doesn't look installed here (no ${client.root()}), so nothing was written.\n` +
        `  Install it, or add this under "mcpServers" in its config yourself:\n    ${cyan(snippet)}`,
    );
  }

  let config = {};
  if (existsSync(configPath)) {
    try {
      config = parseConfigFile(readFileSync(configPath, "utf8"));
    } catch {
      fail(`${configPath} exists but isn't valid JSON — fix or remove it first.`);
    }
  }

  if (config.mcpServers?.astralis) {
    ok(`${client.label} already has an "astralis" MCP server configured:`);
    console.log(dim(JSON.stringify(config.mcpServers.astralis, null, 2)));
    return;
  }

  const backup = existsSync(configPath) ? backupPath(configPath) : null;
  info(`${bold(client.label)} reads MCP servers from a JSON config file.`);
  console.log(`  ${dim("file: ")} ${cyan(configPath)}`);
  console.log(`  ${dim("adds: ")} ${cyan(snippet)}`);
  if (backup) console.log(dim(`  Your current config is copied to ${backup} first.`));

  if (!(await confirm("Proceed?"))) {
    warn("Cancelled.");
    return;
  }

  if (backup) copyFileSync(configPath, backup);
  else mkdirSync(dirname(configPath), { recursive: true });
  config.mcpServers = { ...config.mcpServers, astralis: entry };
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  ok(`written${backup ? dim(` (backup: ${backup})`) : ""}`);
  info(client.reload);
}
