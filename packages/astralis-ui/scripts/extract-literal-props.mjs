/* ==========================================================================
   ASTRALIS — RECIPE-PROP EXTRACTION FROM THE ROLLED-UP .d.ts
   --------------------------------------------------------------------------
   Fills the spec's one known vocabulary gap: each component's OWN props
   (Button's variant, Alert's status, Avatar's shape). These live in recipe
   types the build can't read back as runtime values, but the rolled-up
   dist/index.d.ts states every one of them as a closed union of string
   literals — and the TypeScript checker resolves the alias chains
   (`variant?: AlertVariant`) that defeat text parsing.

   The filter IS the selection logic: a prop qualifies only when its
   non-nullable type is a union made purely of string literals.
   - channel props are `Token | (string & {})`   → string arm, disqualified
   - responsive keywords are `ResponsiveProp<…>`  → object arm, disqualified
   - `size?: never` (Container)                   → no union, disqualified
   so exactly the closed recipe vocabularies fall out, with DOM enumerations
   (button `type`, `inputMode`) as a harmless, correct bonus.

   Derivation, not invention: the .d.ts ships to consumers, so the spec can
   never promise a value the types would reject.
   ========================================================================== */

import ts from "typescript";

/** HTML attribute enums from React's DOM typings — skipped (see below). */
const DOM_ENUM_PROPS = new Set([
  "enterKeyHint",
  "inputMode",
  "popover",
  "popoverTargetAction",
  "translate",
  "unselectable",
  "autoCapitalize",
  "contentEditable",
  "dir",
  "draggable",
  "spellCheck",
  "autoCorrect",
  "crossOrigin",
  "decoding",
  "loading",
  "fetchPriority",
  "referrerPolicy",
  "wrap",
  // NOT "type": Stat.Indicator's type="increase|decrease" is system
  // vocabulary; button's submit/reset riding along is correct anyway.
  "target",
  "method",
  "autoComplete",
  "capture",
  "scope",
]);

/**
 * @param {string} dtsPath absolute path to dist/index.d.ts
 * @returns {Map<string, Record<string, string[]>>} component -> prop -> values
 */
export function extractLiteralProps(dtsPath) {
  const program = ts.createProgram([dtsPath], {
    skipLibCheck: true,
    // The d.ts references react types; resolve them from this package.
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(dtsPath);
  if (!source) throw new Error(`could not load ${dtsPath}`);
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error(`${dtsPath} has no module symbol — not a module?`);

  const result = new Map();
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    const name = symbol.getName();
    if (!/^[A-Z]/.test(name) || /^[A-Z0-9_]+$/.test(name)) continue; // components only

    const type = checker.getTypeOfSymbolAtLocation(symbol, source);
    const signatures = type.getCallSignatures();
    if (signatures.length === 0) continue; // not callable — not a component

    const [param] = signatures[0].getParameters();
    if (!param) continue;
    const paramType = checker.getTypeOfSymbolAtLocation(param, source);

    const props = {};
    for (const propSymbol of paramType.getProperties()) {
      const propName = propSymbol.getName();
      // aria-* / data-* / event handlers: other tiers own these.
      if (propName.startsWith("aria-") || propName.startsWith("data-") || /^on[A-Z]/.test(propName)) continue;
      // Standard HTML attribute enums inherited from React's DOM types: real
      // unions, but not design-system vocabulary — TypeScript already guards
      // them, and repeating them on ~150 components triples the spec for no
      // validator win.
      if (DOM_ENUM_PROPS.has(propName)) continue;
      const propType = checker.getTypeOfSymbolAtLocation(propSymbol, source);
      const values = literalUnionValues(propType);
      if (values) props[propName] = values;
    }
    if (Object.keys(props).length) result.set(name, props);
  }
  return result;
}

/** The values of a pure string-literal union, or null if it isn't one. */
function literalUnionValues(type) {
  const nonNullable = type.getNonNullableType();
  if (!nonNullable.isUnion()) return null;
  const values = [];
  for (const arm of nonNullable.types) {
    if (arm.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) continue;
    if (!arm.isStringLiteral()) return null; // any non-literal arm disqualifies
    values.push(arm.value);
  }
  // A union needs at least two real choices to be a vocabulary.
  return values.length >= 2 ? [...new Set(values)] : null;
}
