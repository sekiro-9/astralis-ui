#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { bold, cyan, dim, fail, CliExit } from "./lib/ui.mjs";

const COMMANDS = {
  create: () => import("./commands/create.mjs"),
  init: () => import("./commands/init.mjs"),
  add: () => import("./commands/add.mjs"),
  theme: () => import("./commands/theme.mjs"),
  "connect-mcp": () => import("./commands/connect-mcp.mjs"),
};

const HELP = `
${bold("astralis")} — setup and tooling for Astralis UI

${bold("Usage")}
  astralis <command> [options]

${bold("Commands")}
  ${cyan("create <name>")}   scaffold a new project with the official scaffolder
                  (create-next-app / create-vite) and wire Astralis into it
                    ${dim("--framework next|vite   Next.js, or React via Vite")}
                    ${dim("--no-starter            keep the scaffolder's demo page")}
                    ${dim("extra args pass straight to the scaffolder")}
  ${cyan("init")}            wire astralis-ui into an existing React project
                    ${dim("Next.js, or React + Vite")}
                    ${dim("--dry-run   show the changes without writing")}
  ${cyan("add <block>...")}  copy a block's source into this project
                    ${dim("--list      every available block, by category")}
                    ${dim("--dir <path>   where to write (default [src/]components/blocks)")}
                    ${dim("--overwrite · --dry-run · --registry <url>")}
  ${cyan("theme")}           generate a static theme stylesheet from a seed
                    ${dim("--brand/--gray <hex> · --font-heading/-body/-mono <stack>")}
                    ${dim("--radius/--spacing/--font-scale/--motion <n>")}
                    ${dim("--out <file> (default astralis-theme.css) · --force")}
                    ${dim("run `astralis theme --help` for the full list")}
  ${cyan("connect-mcp")}     connect a client to the Astralis docs server
                    ${dim("prompts for the client, then configures it for you")}
                    ${dim("--client claude-code|codex|cursor|claude-desktop|antigravity")}
                    ${dim("            skip the prompt and pick the client directly")}

${bold("Docs")}  ${cyan("https://astralis-zeta.vercel.app/docs")}
`;

const [command, ...rest] = process.argv.slice(2);

try {
  if (!command || command === "--help" || command === "-h" || command === "help") {
    console.log(HELP);
  } else if (command === "--version" || command === "-v") {
    const pkg = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8"));
    console.log(pkg.version);
  } else if (COMMANDS[command]) {
    const { run } = await COMMANDS[command]();
    await run(rest);
  } else {
    fail(`Unknown command "${command}" — run ${cyan("astralis --help")}.`);
  }
} catch (error) {
  // fail() has already printed and set the exit code; anything else is a bug
  // and deserves its stack.
  if (!(error instanceof CliExit)) throw error;
}
