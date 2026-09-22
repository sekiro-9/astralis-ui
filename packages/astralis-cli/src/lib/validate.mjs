/* The validator as a library — one import surface for every seat the judge
   sits in: the `astralis validate` command, CI, the MCP validate tool
   (astralis-mcp depends on this subpath via `astralis-cli/validate`) and the
   DevTools bridge (astralis-devtools).
   The core is pure; spec resolution and file collection are the parts that touch disk. */
export { prepareSpec, validateSource } from "./validate-core.mjs";
export { findInstalledLibrary, findInstalledSpec } from "./spec-resolve.mjs";
export { collectSourceFiles, SKIP_DIRS, SOURCE_FILE } from "./source-files.mjs";
