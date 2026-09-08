/** One finding. `line` is 1-based, `column` 1-based; both are 0 when a position is unknown. */
export interface Finding {
  /** Stable rule id, e.g. "unknown-import", "invalid-keyword-value", "missing-alt". */
  code: string;
  file: string;
  line: number;
  column: number;
  message: string;
}

export interface ValidationResult {
  /** Mistakes that render wrong or not at all. Sorted by position. */
  errors: Finding[];
  /** Doctrine nudges and claims file-local analysis can't prove. Sorted by position. */
  warnings: Finding[];
}

export interface ValidateOptions {
  /** Also warn on valid colours that bypass the tokens (the drift check). Default false. */
  strictTokens?: boolean;
}

declare const prepared: unique symbol;

/** Lookup tables built from one spec by prepareSpec(); reuse it across files. */
export interface PreparedSpec {
  readonly [prepared]: true;
}

/**
 * Build the lookup tables for one parsed astralis-ui `dist/system-spec.json`.
 * Takes `unknown` because the spec arrives from disk or the network as JSON.
 */
export function prepareSpec(spec: unknown): PreparedSpec;

/** Validate one TSX/JSX source. Pure, and safe to run in a browser. */
export function validateSource(
  source: string,
  prepared: PreparedSpec,
  filePath?: string,
  opts?: ValidateOptions,
): ValidationResult;
