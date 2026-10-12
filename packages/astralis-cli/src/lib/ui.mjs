import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { banner } from "./menu.mjs";

/** Terminal output helpers: raw ANSI, off when piped or when NO_COLOR is set. */

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (open, close) => (text) => (useColor ? `\x1b[${open}m${text}\x1b[${close}m` : String(text));

export const bold = wrap(1, 22);
export const dim = wrap(2, 22);
export const red = wrap(31, 39);
export const green = wrap(32, 39);
export const yellow = wrap(33, 39);
export const cyan = wrap(36, 39);

export const ok = (message) => console.log(`${green("✓")} ${message}`);
export const warn = (message) => console.log(`${yellow("!")} ${message}`);
export const info = (message) => console.log(`${cyan("→")} ${message}`);

/**
 * One line: the CLI's name and version, and what this command is
 * about to do. In a terminal only: piped output and CI logs stay as they were.
 */
export function printBanner(subtitle) {
  if (!process.stdout.isTTY) return;
  const { version } = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
  console.log(banner({ version, subtitle, color: useColor }));
}

/** Forward slashes on every platform: shown paths and import specifiers both want them. */
export const posix = (path) => path.split("\\").join("/");

/** Thrown by fail() once the message is printed; index.mjs stops quietly on it. */
export class CliExit extends Error {}

/**
 * Print the error and stop: the CLI's only failure path. It unwinds instead of
 * calling process.exit(), which on Windows trips a libuv assertion (exit 127)
 * when a fetch() handle is still open.
 */
export function fail(message) {
  console.error(`${red("✗")} ${message}`);
  process.exitCode = 1;
  throw new CliExit(message);
}

/* ---- prompts ------------------------------------------------------------------ */

let assumeYes = false;

/** Set by the global -y/--yes: no prompt is shown and each takes its default. */
export function setAssumeYes(value) {
  assumeYes = value;
}

export const isAssumeYes = () => assumeYes;

const PROMPT_CHILD = fileURLToPath(new URL("./prompt-child.mjs", import.meta.url));

/**
 * Read one line from the user, or null when there is no one to answer (stdin
 * at EOF, as in CI). Reads in a child process so this one never touches stdin;
 * prompt-child.mjs explains why.
 */
export function ask(promptText) {
  const result = spawnSync(process.execPath, [PROMPT_CHILD, promptText], {
    stdio: ["inherit", "pipe", "inherit"],
    encoding: "utf8",
  });
  if (result.status !== 0) {
    if (result.status === 3) process.stderr.write("\n");
    return null;
  }
  return result.stdout.trim();
}

const noAnswer = (question, hint) =>
  fail(`No answer to "${question}": there is no input to read.${hint ? ` ${hint}` : ""}`);

/**
 * An arrow-key menu in a terminal, run in the prompt child like ask(). The
 * chosen index; null when there is no terminal to draw it in. Cancelling
 * stops the command.
 */
export function menu(question, options, index = 0) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return null;
  const spec = JSON.stringify({ question, options: options.map(({ label, hint }) => ({ label, hint })), index, color: useColor });
  const result = spawnSync(process.execPath, [PROMPT_CHILD, "--menu", spec], {
    stdio: ["inherit", "pipe", "inherit"],
    encoding: "utf8",
  });
  if (result.status === 130) fail("Cancelled.");
  if (result.status !== 0) return null;
  return Number(result.stdout.trim());
}

/** Yes or no; default no. Always yes under --yes. `hint` says how to answer non-interactively. */
export async function confirm(question, { hint = "Pass --yes to proceed without prompts." } = {}) {
  if (assumeYes) return true;
  const chosen = menu(question, [{ label: "Yes" }, { label: "No" }], 1);
  if (chosen !== null) return chosen === 0;
  const answer = ask(`${question} ${dim("(y/N)")} `);
  if (answer === null) noAnswer(question, hint);
  return /^y(es)?$/i.test(answer);
}

/**
 * Single-choice prompt. `options` is [{ value, label, hint? }]. An arrow-key
 * menu in a terminal; a numbered prompt otherwise, which returns null if the
 * answer isn't a listed number. Under --yes, or with no input, it stops with
 * `hint`: a choice has no safe default.
 */
export async function select(question, options, { hint } = {}) {
  if (assumeYes) fail(`"${question}" needs an answer, and --yes can't pick one.${hint ? ` ${hint}` : ""}`);
  const chosen = menu(question, options);
  if (chosen !== null) return options[chosen]?.value ?? null;
  console.log(question);
  options.forEach((o, i) => console.log(`  ${cyan(String(i + 1))}  ${o.label}`));
  const answer = ask(`${dim("Enter a number:")} `);
  if (answer === null) noAnswer(question, hint);
  return options[Number(answer) - 1]?.value ?? null;
}
