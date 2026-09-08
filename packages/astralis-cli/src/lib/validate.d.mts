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
