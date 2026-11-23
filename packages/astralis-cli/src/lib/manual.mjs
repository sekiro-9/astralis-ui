import { accessSync, constants, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { bold, cyan, dim, warn } from "./ui.mjs";

/**
 * The one fallback every command uses when it can't find, read, edit or write
 * a file: say what was not done and why, the steps that finish it, how to
 * check, and the docs section that explains it all. test/fallbacks.test.mjs
 * holds every link here to a heading that exists.
 */

const SITE = "https://astralis-ui.com/docs";
export const DOCS = {
  byHand: `${SITE}/installation#by-hand`,
  next: `${SITE}/installation#nextjs-app-router`,
  nextPages: `${SITE}/installation#nextjs-pages-router`,
  vite: `${SITE}/installation#vite--spa`,
  theme: `${SITE}/cli#adding-the-theme-by-hand`,
  devtools: `${SITE}/devtools#by-hand`,
  ci: `${SITE}/validate-in-ci#set-up-ci-by-hand`,
  create: `${SITE}/cli#creating-a-project-by-hand`,
};

/**
 * What one part of a command still needs done by hand. `failed` marks a part
 * the command tried and could not do, which makes the exit code 1; a shape it
 * won't edit leaves it 0. `retry` is the command to run once the cause is fixed.
 */
export function createGuide({ title, docs, check, retry }) {
  return {
    title,
    docs,
    check,
    retry,
    reasons: [],
    steps: [],
    failed: false,
    /** Record one thing that was not done, as the reader should see it. */
    because(reason, { failed = false } = {}) {
      this.reasons.push(reason);
      this.failed ||= failed;
      return this;
    },
    /** One numbered step: what to do, and the exact code or command. */
    step(text, code) {
      this.steps.push({ text, code });
      return this;
    },
    get needed() {
      return this.reasons.length > 0;
    },
  };
}

const indent = (text, by) =>
  text
    .split("\n")
    .map((line) => (line ? by + line : line))
    .join("\n");

/** A guide as the text every command prints, without the leading marker. */
export function formatGuide(guide) {
  const lines = [`${guide.title}:`, ...guide.reasons.map((reason) => `    - ${reason}`)];
  lines.push("", `  ${bold("Manual setup:")}`);
  guide.steps.forEach(({ text, code }, i) => {
    lines.push(`    ${i + 1}. ${text}`);
    if (code) lines.push(cyan(indent(code.trimEnd(), "         ")));
  });
  lines.push("");
  if (guide.check) lines.push(`  ${bold("Check it worked:")} ${guide.check}`);
  if (guide.retry) lines.push(`  ${dim("Or fix the cause and run it again:")} ${cyan(guide.retry)}`);
  lines.push(`  ${bold("Full guide:")} ${cyan(guide.docs)}`);
  return lines.join("\n");
}

/** Print a guide if it has anything to say, and set the exit code it asks for. */
export function printGuide(guide) {
  if (!guide?.needed) return;
  console.log();
  warn(formatGuide(guide));
  if (guide.failed) process.exitCode = 1;
}

const PLAIN = {
  EACCES: "it is read-only, or you don't have permission",
  EPERM: "it is read-only, or you don't have permission",
  EROFS: "the disk is read-only",
  EISDIR: "it is a folder, not a file",
  ENOENT: "it doesn't exist",
  ENOTDIR: "part of its path is a file, not a folder",
  EEXIST: "a file is in the way of its folder",
  EBUSY: "another program has it open",
  ENOSPC: "the disk is full",
};

/** Why a file operation failed, in plain words with the system's code. */
function fileProblem(error) {
  return PLAIN[error?.code] ? `${PLAIN[error.code]} (${error.code})` : (error?.message ?? String(error));
}

/** { text } or { problem }; never throws. */
export function tryRead(path) {
  try {
    return { text: readFileSync(path, "utf8") };
  } catch (error) {
    return { problem: fileProblem(error) };
  }
}

/**
 * Write a file, making its folder. Null on success, else why not; never
 * throws. A dry run writes nothing but still reports a file it couldn't replace.
 */
export function tryWrite(path, text, { dryRun = false } = {}) {
  try {
    if (dryRun) {
      if (existsSync(path)) accessSync(path, constants.W_OK);
      return null;
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
    return null;
  } catch (error) {
    return fileProblem(error);
  }
}

/** Why a spawned command failed. */
export const commandProblem = (result) =>
  result.error?.code === "ENOENT" ? "the program was not found" : (result.error?.message ?? `it exited with code ${result.status}`);
