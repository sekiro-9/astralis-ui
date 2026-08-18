/* The validator as a library — one import surface for every seat the judge
   sits in: the `astralis validate` command, CI, and the MCP validate tool
   (astralis-mcp depends on this subpath via `astralis-cli/validate`).
   The core is pure; spec resolution is the only part that touches disk. */
export { prepareSpec, validateSource } from "./validate-core.mjs";
export { findInstalledSpec } from "./spec-resolve.mjs";
