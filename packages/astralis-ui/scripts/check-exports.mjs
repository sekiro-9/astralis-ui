/* ==========================================================================
   ASTRALIS — PACKAGE EXPORTS GATE
   --------------------------------------------------------------------------
   For every entry in package.json "exports":
     - each target file exists in the built package;
     - where an entry pairs "types" with "import", every runtime export of the
       module is declared by its types, and every declared value is real.
   A subpath whose declarations lag its module type-checks against functions
   that are not there, or hides ones that are.

   Runs in `build` after the types are emitted; exits non-zero on any miss.
   ========================================================================== */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import ts from "typescript";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
const problems = [];

/** Exported names of a declaration file, split into values and types. */
function declaredExports(file) {
  const program = ts.createProgram([file], { skipLibCheck: true, noEmit: true });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(file);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!moduleSymbol) return null;
  const values = new Set();
  for (const sym of checker.getExportsOfModule(moduleSymbol)) {
    const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
    if (target.flags & ts.SymbolFlags.Value) values.add(sym.getName());
  }
  return values;
}

let checked = 0;
for (const [subpath, target] of Object.entries(pkg.exports)) {
  const entry = typeof target === "string" ? { default: target } : target;
  for (const file of Object.values(entry)) {
    if (!existsSync(join(PKG, file))) problems.push(`${subpath}: ${file} does not exist`);
  }
  if (!entry.types || !entry.import) continue;
  if (!existsSync(join(PKG, entry.types)) || !existsSync(join(PKG, entry.import))) continue;

  const runtime = new Set(Object.keys(await import(pathToFileURL(join(PKG, entry.import)).href)));
  const declared = declaredExports(join(PKG, entry.types));
  if (!declared) {
    problems.push(`${subpath}: ${entry.types} is not a module`);
    continue;
  }
  for (const name of runtime) {
    if (!declared.has(name)) problems.push(`${subpath}: runtime export "${name}" is not declared in ${entry.types}`);
  }
  for (const name of declared) {
    if (!runtime.has(name)) problems.push(`${subpath}: ${entry.types} declares "${name}", which the module does not export`);
  }
  checked++;
}

if (problems.length) {
  console.error(`[astralis] EXPORTS FAILURE — ${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`[astralis] exports: ${Object.keys(pkg.exports).length} entries resolve; ${checked} typed entries match their modules`);
