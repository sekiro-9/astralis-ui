#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { cyan, dim, red, fail, CliExit } from "./lib/ui.mjs";
import { COMMANDS } from "./lib/commands.mjs";
import { mainHelp } from "./lib/args.mjs";
import { suggest } from "./lib/suggest.mjs";

const MODULES = {
  create: () => import("./commands/create.mjs"),
  init: () => import("./commands/init.mjs"),
  add: () => import("./commands/add.mjs"),
  theme: () => import("./commands/theme.mjs"),
  validate: () => import("./commands/validate.mjs"),
  report: () => import("./commands/report.mjs"),
  "connect-mcp": () => import("./commands/connect-mcp.mjs"),
};

const [name, ...rest] = process.argv.slice(2);
const debug = process.argv.includes("--debug");

try {
  if (!name || name === "--help" || name === "-h" || name === "help") {
    console.log(mainHelp(COMMANDS));
  } else if (name === "--version" || name === "-v") {
    console.log(JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version);
  } else if (MODULES[name]) {
    const { run } = await MODULES[name]();
    await run(rest);
  } else {
    const near = suggest(name, Object.keys(MODULES));
    fail(`Unknown command "${name}".${near ? ` Did you mean "${near}"?` : ""} Run ${cyan("astralis --help")} for the list.`);
  }
} catch (error) {
  if (!(error instanceof CliExit)) {
    process.exitCode = 1;
    if (debug) {
      console.error(error);
    } else {
      console.error(`${red("✗")} Unexpected error: ${error?.message ?? error}`);
      console.error(dim(`  Run it again with --debug for the stack trace.`));
    }
  }
}
