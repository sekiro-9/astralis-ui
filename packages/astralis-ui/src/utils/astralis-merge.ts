import { clsx, type ClassValue } from "clsx";
import { createTailwindMerge } from "tailwind-merge";
import { MERGE_CONFIG } from "./merge-config.generated";

/* createTailwindMerge, not extendTailwindMerge: the latter bundles
   tailwind-merge's whole default config. MERGE_CONFIG is that config plus the
   library's additions (scripts/merge-config.mjs), cut down to the utilities in
   the compiled stylesheet; check-merge-config proves it merges those exactly
   as the full config does. */
const twMerge = createTailwindMerge(() => MERGE_CONFIG);

export function astralisMerge(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
