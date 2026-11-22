/* ==========================================================================
   ASTRALIS — MERGE CONFIG GENERATOR
   --------------------------------------------------------------------------
   Writes src/utils/merge-config.generated.ts: tailwind-merge's config cut
   down to the utilities in dist/styles.css (how: scripts/merge-config.mjs).
   It needs a built stylesheet, so run it after a build and build again;
   check-merge-config fails the build while the committed file is stale.
   ========================================================================== */

import { writeFileSync } from "node:fs";
import { relative } from "node:path";
import { OUTPUT, PKG, buildMergeConfig, emitMergeConfig, stylesheetClasses } from "./merge-config.mjs";

const config = await buildMergeConfig(stylesheetClasses());
writeFileSync(OUTPUT, emitMergeConfig(config));
const groups = Object.keys(config.classGroups).length;
const keys = Object.values(config.classGroups).reduce((n, list) => n + list.length, 0);
console.log(`[astralis] merge config: ${keys} utilities in ${groups} groups -> ${relative(PKG, OUTPUT)}`);
