import { GLOBAL_OPTIONS, DOCS_URL } from "./commands.mjs";
import { bold, cyan, dim, fail, setAssumeYes } from "./ui.mjs";
import { suggest } from "./suggest.mjs";

/**
 * The one argument parser every command uses. Accepts `--name value`,
 * `--name=value` and the global flags; a string value may itself start with a
 * dash (`--font-body "-apple-system, sans-serif"`).
 *
 * Returns { values, positionals, forwarded }, or null once --help is printed.
 * A `passthrough` command collects unknown options, in order, into `forwarded`
 * instead of rejecting them.
 */
export function parseCommandArgs(command, argv) {
  const options = [...command.options, ...GLOBAL_OPTIONS];
  const byName = new Map(options.map((o) => [o.name, o]));
  const byShort = new Map(options.filter((o) => o.short).map((o) => [o.short, o]));
  const values = Object.fromEntries(options.filter((o) => o.type === "boolean").map((o) => [o.name, false]));
  const positionals = [];
  const forwarded = [];
  const usageHint = `Run ${cyan(`astralis ${command.name} --help`)} for its options.`;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      (command.passthrough ? forwarded : positionals).push(...argv.slice(i + 1));
      break;
    }

    let option = null;
    let inline;
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      const name = eq === -1 ? arg.slice(2) : arg.slice(2, eq);
      inline = eq === -1 ? undefined : arg.slice(eq + 1);
      option = byName.get(name) ?? null;
      if (!option) {
        if (command.passthrough) {
          forwarded.push(arg);
          continue;
        }
        const near = suggest(name, [...byName.keys()]);
        fail(`Unknown option --${name} for astralis ${command.name}.${near ? ` Did you mean --${near}?` : ""}\n  ${usageHint}`);
      }
    } else if (/^-[a-zA-Z]$/.test(arg)) {
      option = byShort.get(arg.slice(1)) ?? null;
      if (!option) {
        if (command.passthrough) {
          forwarded.push(arg);
          continue;
        }
        fail(`Unknown option ${arg} for astralis ${command.name}.\n  ${usageHint}`);
      }
    } else if (command.passthrough && arg.startsWith("-")) {
      forwarded.push(arg);
      continue;
    } else {
      if (command.passthrough && positionals.length >= command.maxPositionals) forwarded.push(arg);
      else positionals.push(arg);
      continue;
    }

    if (option.type === "boolean") {
      if (inline !== undefined) fail(`--${option.name} takes no value.\n  ${usageHint}`);
      values[option.name] = true;
    } else {
      const value = inline ?? argv[++i];
      if (value === undefined) fail(`--${option.name} needs a value${option.arg ? ` (${option.arg})` : ""}.\n  ${usageHint}`);
      values[option.name] = value;
    }
  }

  if (values.help) {
    console.log(commandHelp(command));
    return null;
  }
  if (positionals.length > command.maxPositionals) {
    const extra = positionals.slice(command.maxPositionals).map((p) => `"${p}"`).join(", ");
    fail(`astralis ${command.name} doesn't take ${extra}.\n  ${usageHint}`);
  }
  if (values.yes) setAssumeYes(true);
  return { values, positionals, forwarded };
}

/* ---- help text, rendered from the same table -------------------------------- */

const flagLabel = (o) =>
  `${o.short ? `-${o.short}, ` : ""}--${o.name}${o.type === "string" ? ` <${o.arg ?? "value"}>` : ""}`;

function optionLines(options) {
  const width = Math.max(...options.map((o) => flagLabel(o).length)) + 2;
  return options.map((o) => {
    const extra = o.default ? dim(` (default: ${o.default})`) : "";
    return `    ${flagLabel(o).padEnd(width)}${o.description}${extra}`;
  });
}

export function commandHelp(command) {
  const lines = [`${bold("Usage")}  astralis ${command.name}${command.args ? ` ${command.args}` : ""} [options]`, ""];
  lines.push(`  ${command.summary}.`, "");

  const groups = [...new Set(command.options.map((o) => o.group ?? "Options"))];
  for (const group of groups) {
    lines.push(`  ${bold(group)}`, ...optionLines(command.options.filter((o) => (o.group ?? "Options") === group)), "");
  }
  lines.push(`  ${bold("Global options")}`, ...optionLines(GLOBAL_OPTIONS), "");

  for (const note of command.notes ?? []) lines.push(`  ${dim(note)}`);
  if (command.notes?.length) lines.push("");
  lines.push(`  ${bold("Examples")}`, ...command.examples.map((e) => `    ${cyan(e)}`), "");
  lines.push(`  ${dim("Docs")} ${cyan(DOCS_URL)}`);
  return lines.join("\n");
}

export function mainHelp(commands) {
  const label = (c) => `${c.name}${c.args ? ` ${c.args}` : ""}`;
  const width = Math.max(...commands.map((c) => label(c).length)) + 2;
  const versionFlag = { name: "version", short: "v", type: "boolean", description: "Print the CLI version." };
  return [
    "",
    `${bold("astralis")} — setup and tooling for Astralis UI`,
    "",
    `${bold("Usage")}  astralis <command> [options]`,
    "",
    `  ${bold("Commands")}`,
    ...commands.map((c) => `    ${cyan(label(c).padEnd(width))}${c.summary}`),
    "",
    `  ${bold("Global options")}`,
    ...optionLines([...GLOBAL_OPTIONS, versionFlag]),
    "",
    `  Run ${cyan("astralis <command> --help")} for a command's options.`,
    `  ${dim("Docs")} ${cyan(DOCS_URL)}`,
    "",
  ].join("\n");
}
