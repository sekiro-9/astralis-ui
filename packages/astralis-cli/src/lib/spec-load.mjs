import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cyan, fail } from "./ui.mjs";
import { findInstalledSpec } from "./spec-resolve.mjs";

/**
 * The system spec a command judges against: `explicitPath` when given, else
 * the installed astralis-ui's. Returns { spec, text } (the raw text is what a
 * snapshot hashes) or stops the command with a message that says what to do.
 */
export function loadSpec(explicitPath, cwd = process.cwd()) {
  const path = explicitPath ? resolve(explicitPath) : findInstalledSpec(cwd);
  if (!path) {
    fail(`Could not find astralis-ui's system spec here — is astralis-ui installed? (or pass ${cyan("--spec <path>")})`);
  }
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    fail(`Can't read the spec at ${path} (${error.code ?? error.message}).`);
  }
  let spec;
  try {
    spec = JSON.parse(text);
  } catch {
    fail(`${path} isn't valid JSON — expected astralis-ui's dist/system-spec.json.`);
  }
  if (!spec?.components || !Array.isArray(spec.classes)) {
    fail(`${path} isn't an astralis-ui system spec (it has no components or classes).`);
  }
  return { spec, text };
}
