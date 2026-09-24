import "server-only";

import { toRepro, type Snapshot } from "astralis-cli/snapshot";
import { type Finding, prepareSpec, type PreparedSpec, validateSource } from "astralis-cli/validate-core";
import spec from "astralis-ui/system-spec.json";

import { uiVersion } from "@/lib/ui-version";

let prepared: PreparedSpec | null = null;

export interface ReproCheck {
  source: string;
  errors: Finding[];
  warnings: Finding[];
  /** The astralis-ui version whose spec the platform checked against. */
  checkedWith: string;
}

/**
 * A report's repro.tsx, and the validator's verdict on it with the spec of
 * the astralis-ui version this site documents. The file is only parsed and
 * checked, never run.
 */
export function checkRepro(snapshot: Snapshot): ReproCheck {
  prepared ??= prepareSpec(spec);
  const source = toRepro(snapshot);
  const { errors, warnings } = validateSource(source, prepared, "repro.tsx");
  return { source, errors, warnings, checkedWith: uiVersion };
}
