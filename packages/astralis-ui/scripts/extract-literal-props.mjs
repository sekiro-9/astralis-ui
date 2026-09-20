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
  return extractComponentTypes(dtsPath).literal;
}

/** Own props too generic to describe a component. */
const GENERIC_PROPS = new Set(["className", "style", "id", "children"]);

/**
 * Three readings of the props types in one pass: the closed vocabularies; the
 * scalar props the library itself declares (booleans like Collapsible's
 * defaultOpen, open strings like its name, numbers), which inherited DOM
 * attributes are not; and the props a component cannot render without. A builder that places a
 * component with nothing set needs the second list to know what it must
 * supply (Image's src and alt) and which components it cannot place at all
 * (TableOfContents wants an items array no prop editor can type).
 *
 * Two more readings serve the style-prop groups the spec assigns by table:
 * `propNames`, every prop the component's type accepts, and `redefined`, the
 * props a component declares itself with a non-responsive type (Image's
 * intrinsic `width`), which therefore are not the group's style prop of the
 * same name. `needsChildren` names the components whose children are not
 * optional; `exports` is every name the entry point exports, values and types.
 *
 * @param {string} dtsPath absolute path to dist/index.d.ts
 * @returns {{
 *   literal: Map<string, Record<string, string[]>>,
 *   scalar: Map<string, Record<string, "boolean" | "string" | "number">>,
 *   required: Map<string, Record<string, string>>,
 *   propNames: Map<string, Set<string>>,
 *   redefined: Map<string, string[]>,
 *   needsChildren: Set<string>,
 *   exports: string[],
 * }}
 */
export function extractComponentTypes(dtsPath) {
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
  const scalar = new Map();
  const required = new Map();
  const propNames = new Map();
  const redefined = new Map();
  const needsChildren = new Set();
  const moduleExports = checker.getExportsOfModule(moduleSymbol);
  for (const symbol of moduleExports) {
    const name = symbol.getName();
    if (!/^[A-Z]/.test(name) || /^[A-Z0-9_]+$/.test(name)) continue; // components only

    const type = checker.getTypeOfSymbolAtLocation(symbol, source);
    const signatures = type.getCallSignatures();
    if (signatures.length === 0) continue; // not callable — not a component

    const [param] = signatures[0].getParameters();
    if (!param) continue;
    const paramType = checker.getTypeOfSymbolAtLocation(param, source);

    const props = {};
    const scalars = {};
    const needed = {};
    const own = [];
    propNames.set(name, new Set(paramType.getProperties().map((p) => p.getName())));
    for (const propSymbol of paramType.getProperties()) {
      const propName = propSymbol.getName();
      if (isRedefinedHere(propSymbol, name)) own.push(propName);
      if (!(propSymbol.flags & ts.SymbolFlags.Optional) && propName === "children") needsChildren.add(name);
      if (!(propSymbol.flags & ts.SymbolFlags.Optional) && propName !== "children") {
        needed[propName] = kindOf(checker.getTypeOfSymbolAtLocation(propSymbol, source));
      }
      // aria-* / data-* / event handlers: other tiers own these.
      if (propName.startsWith("aria-") || propName.startsWith("data-") || /^on[A-Z]/.test(propName)) continue;
      const propType = checker.getTypeOfSymbolAtLocation(propSymbol, source);
      const values = literalUnionValues(propType);
      if (values) {
        // Standard HTML attribute enums inherited from React's DOM types: real
        // unions, but not design-system vocabulary — TypeScript already guards
        // them, and repeating them on ~150 components triples the spec for no
        // validator win.
        if (!DOM_ENUM_PROPS.has(propName)) props[propName] = values;
        continue;
      }
      const ownDeclaration = propSymbol.declarations?.some((d) => d.getSourceFile() === source);
      const kind = kindOf(propType);
      if (ownDeclaration && kind !== "other" && !GENERIC_PROPS.has(propName)) scalars[propName] = kind;
    }
    if (Object.keys(props).length) result.set(name, props);
    if (Object.keys(scalars).length) scalar.set(name, scalars);
    if (Object.keys(needed).length) required.set(name, needed);
    if (own.length) redefined.set(name, own);
  }
  const exports = moduleExports.map((s) => s.getName()).sort();
  return { literal: result, scalar, required, propNames, redefined, needsChildren, exports };
}

/**
 * Declared in the component's own props type (ImageProps, LinkProps…) with a
 * type that takes no responsive map. A style prop always does, so a prop like
 * that is the component's own attribute that happens to share a style prop's name.
 */
function isRedefinedHere(propSymbol, componentName) {
  return (propSymbol.declarations ?? []).some((declaration) => {
    if (!ts.isPropertySignature(declaration) || !declaration.type) return false;
    const owner = declaration.parent;
    const ownerName = ts.isInterfaceDeclaration(owner)
      ? owner.name.text
      : ts.isTypeLiteralNode(owner) && ts.isTypeAliasDeclaration(owner.parent)
        ? owner.parent.name.text
        : null;
    return ownerName?.startsWith(componentName) === true && !/\bResponsive/.test(declaration.type.getText());
  });
}

/** What a value for the prop looks like: a builder can type a string or a
 *  number, and nothing else. */
function kindOf(type) {
  const nonNullable = type.getNonNullableType();
  const arms = nonNullable.isUnion() ? nonNullable.types : [nonNullable];
  if (arms.every((arm) => arm.flags & ts.TypeFlags.StringLike)) return "string";
  if (arms.every((arm) => arm.flags & ts.TypeFlags.NumberLike)) return "number";
  if (arms.every((arm) => arm.flags & ts.TypeFlags.BooleanLike)) return "boolean";
  return "other";
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
