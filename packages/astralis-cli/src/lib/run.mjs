import { spawnSync } from "node:child_process";

/**
 * Run a program with an argument array, never a concatenated shell string.
 *
 * POSIX spawns it directly: no shell, so nothing is globbed or split. Windows
 * has to go through cmd.exe, because npm, pnpm and yarn are .cmd shims that
 * can't be spawned without it; each argument is quoted for cmd there, and the
 * ones cmd can't carry safely are refused rather than mangled.
 */
export function runCommand(bin, args, { platform = process.platform, ...options } = {}) {
  if (platform !== "win32") return spawnSync(bin, args, { stdio: "inherit", ...options });
  const line = [bin, ...args].map(quoteForCmd).join(" ");
  return spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `"${line}"`], {
    stdio: "inherit",
    windowsVerbatimArguments: true,
    ...options,
  });
}

/** Characters cmd.exe gives meaning to. Inside double quotes it treats them as text. */
const CMD_SPECIAL = /[\s&|<>()^,;=!]/;

export class UnsafeArgumentError extends Error {}

/**
 * One argument as cmd.exe and the program's argv parser will both read it back.
 * `"` and `%` can't be protected by quoting in cmd, and a newline ends the
 * command, so those are refused.
 */
export function quoteForCmd(arg) {
  const text = String(arg);
  if (/["%\r\n]/.test(text)) {
    throw new UnsafeArgumentError(`can't pass ${JSON.stringify(text)} through cmd.exe safely`);
  }
  if (text !== "" && !CMD_SPECIAL.test(text)) return text;
  // A trailing backslash would escape the closing quote in the program's argv parser.
  return `"${text.replace(/(\\+)$/, "$1$1")}"`;
}
