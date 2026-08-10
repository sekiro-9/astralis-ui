import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Terminal output helpers — raw ANSI, no dependencies. Colors switch off for
 * non-TTY output (piped) and when NO_COLOR is set, per convention.
 */

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

/** Thrown by fail() once the message is printed — index.mjs stops quietly on it. */
export class CliExit extends Error {}

/**
 * Print the error and stop — the CLI's only failure path.
 *
 * Sets an exit code and unwinds rather than calling process.exit(): on Windows,
 * process.exit() after any fetch() trips a libuv assertion
 * (`!(handle->flags & UV_HANDLE_CLOSING)`) and reports exit 127 instead of 1.
 * Verified in isolation — fetch alone is clean, exit alone is clean, only the
 * pair crashes. Unwinding lets the event loop drain, so finally blocks run.
 */
export function fail(message) {
  console.error(`${red("✗")} ${message}`);
  process.exitCode = 1;
  throw new CliExit(message);
}

const PROMPT_CHILD = fileURLToPath(new URL("./prompt-child.mjs", import.meta.url));

/**
 * Read one line from the user, in a child process that exits immediately.
 *
 * This CLI must never read its own stdin. On Windows libuv services a TTY on a
 * dedicated thread blocked in ReadConsoleInputW, and once started that thread
 * cannot be stopped — not by readline.close(), not by pause(), not by dropping
 * listeners. A process that has read stdin even once keeps consuming console
 * input records for the rest of its life, starving any interactive child it
 * later spawns. `astralis create` asked which framework, then handed over to
 * create-vite, whose arrow-key menu drew perfectly and never received a
 * keystroke; Ctrl+C did not reach it either.
 *
 * Isolated in a child, the read thread dies when the child exits and the
 * terminal is clean for the scaffolder. Piped input still works: the child
 * inherits the same stdin, and each prompt consumes one line.
 */
export function ask(promptText) {
  const result = spawnSync(process.execPath, [PROMPT_CHILD, promptText], {
    stdio: ["inherit", "pipe", "inherit"],
    encoding: "utf8",
  });
  return (result.stdout ?? "").trim();
}

/** y/N prompt; default no. */
export async function confirm(question) {
  const answer = await ask(`${question} ${dim("(y/N)")} `);
  return /^y(es)?$/i.test(answer.trim());
}

/**
 * Numbered single-choice prompt. `options` is [{ value, label }].
 * Returns the chosen value, or null if the answer isn't a listed number.
 */
export async function select(question, options) {
  console.log(question);
  options.forEach((o, i) => console.log(`  ${cyan(String(i + 1))}  ${o.label}`));
  const answer = await ask(`${dim("Enter a number:")} `);
  return options[Number(answer.trim()) - 1]?.value ?? null;
}
