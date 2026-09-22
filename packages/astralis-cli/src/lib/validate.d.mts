export {
  prepareSpec,
  validateSource,
  type Finding,
  type ValidationResult,
  type ValidateOptions,
  type PreparedSpec,
} from "./validate-core.mjs";

/**
 * Walk up from `startDir` to the nearest installed astralis-ui's
 * `dist/system-spec.json`. Returns its path, or null. Node only.
 */
export function findInstalledSpec(startDir: string): string | null;

/**
 * Walk up from `startDir` to the nearest `node_modules/astralis-ui/<file>`
 * (default `package.json`). Returns its path, or null. Node only.
 */
export function findInstalledLibrary(startDir: string, file?: string): string | null;

/**
 * Every .tsx/.jsx file at or under `path`, skipping dependency and build
 * folders (SKIP_DIRS): the files `astralis validate` checks. Appends to
 * `into` and returns it, or returns null when `path` does not exist. Node only.
 */
export function collectSourceFiles(path: string, into?: string[]): string[] | null;

/** Folder names never descended into. */
export const SKIP_DIRS: ReadonlySet<string>;

/** Matches the file names that are validated (.tsx and .jsx). */
export const SOURCE_FILE: RegExp;
