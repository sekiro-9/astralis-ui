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
   - responsive keywords are `ResponsiveProp<…>`  → object arm, reported
     apart (`responsive`), since they are the style groups' props unless the
     spec finds them outside every group the component has
   - `size?: never` (Container)                   → no union, disqualified
   - attributes inherited from React's DOM and SVG types (a button's `type`,
     an svg's `strokeLinecap`)                    → the element's, skipped
   so exactly the closed recipe vocabularies fall out.

   Derivation, not invention: the .d.ts ships to consumers, so the spec can
   never promise a value the types would reject.
   ========================================================================== */

import ts from "typescript";
import { jsDocOf } from "./prop-docs.mjs";

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
  // NOT "type": Stat.Indicator's type="increase|decrease" is system vocabulary.
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
 * `inherited` is every prop the component takes only because its type extends
 * React's DOM or SVG attributes (Textarea's `rows`, Icon's `opacity`, the HTML
 * `color`); `domAttributes` is the same less that `color`, which paints
 * nothing on the elements the library renders.
 *
 * For the prop documentation: `ownProps`, the props the library itself
 * declares (not React's DOM attributes), and `docs`, their JSDoc; `partDocs`
 * and `partOwnProps` are the same read through the owner for each attached
 * part (Menu.Item), which has no export of its own to be read by.
 *
 * @param {string} dtsPath absolute path to dist/index.d.ts
 * @param {{ responsiveKeys?: Set<string> }} [options] the keys a responsive
 *   map may carry; without them responsive vocabularies are not read
 * @returns {{
 *   literal: Map<string, Record<string, string[]>>,
 *   responsive: Map<string, Record<string, string[]>>,
 *   scalar: Map<string, Record<string, "boolean" | "string" | "number">>,
 *   takesMap: Map<string, Set<string>>,
 *   required: Map<string, Record<string, string>>,
 *   propNames: Map<string, Set<string>>,
 *   redefined: Map<string, string[]>,
 *   needsChildren: Set<string>,
 *   ownProps: Map<string, string[]>,
 *   docs: Map<string, Record<string, { description?: string, default?: string, deprecated?: string, declaredIn?: string }>>,
 *   partOwnProps: Map<string, Record<string, string[]>>,
 *   partDocs: Map<string, Record<string, Record<string, { description?: string, default?: string, deprecated?: string, declaredIn?: string }>>>,
 *   inherited: Map<string, Set<string>>,
 *   domAttributes: Map<string, Set<string>>,
 *   exports: string[],
 * }}
 */
export function extractComponentTypes(dtsPath, { responsiveKeys } = {}) {
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
  const responsive = new Map();
  const scalar = new Map();
  const responsiveNames = new Map();
  const required = new Map();
  const propNames = new Map();
  const redefined = new Map();
  const needsChildren = new Set();
  const ownProps = new Map();
  const docs = new Map();
  const partOwnProps = new Map();
  const partDocs = new Map();
  const inheritedProps = new Map();
  const domAttributes = new Map();

  const declaredHere = (propSymbol) => propSymbol.declarations?.some((d) => d.getSourceFile() === source) === true;
  // A prop with no declaration at all comes from one of the library's mapped
  // types (the long-spelling aliases, the state props), so it is the library's.
  const isInheritedAttribute = (propSymbol) => (propSymbol.declarations?.length ?? 0) > 0 && !declaredHere(propSymbol);
  /** The library's own props of one props type, and the JSDoc of each. */
  const documentation = (paramType) => {
    const names = [];
    const found = {};
    for (const propSymbol of paramType.getProperties()) {
      const propName = propSymbol.getName();
      if (!declaredHere(propSymbol) || UNDOCUMENTED_PROPS.has(propName) || /^(aria|data)-/.test(propName)) continue;
      names.push(propName);
      const doc = jsDocOf(propSymbol, checker);
      if (!doc) continue;
      // Where a default was written: a wrapper that inherits another
      // component's props type (ContextMenu, MenuProps) may change it.
      const declaredIn = propSymbol.declarations.find((d) => d.getSourceFile() === source);
      const typeName = ts.isPropertySignature(declaredIn) ? declaringTypeName(declaredIn) : null;
      found[propName] = typeName && doc.default !== undefined ? { ...doc, declaredIn: typeName } : doc;
    }
    return { names, found };
  };
  /** A prop's type. A polymorphic component's props type keeps its type
   *  parameter (`Omit<FlexProps<T>, "direction">` on Stack), so its props read
   *  as `FlexProps<T>["colorScheme"]`, which no reading below recognises; the
   *  prop is looked up on that object type instead, where it is concrete. */
  const typeOfProp = (propSymbol) => {
    let type = checker.getTypeOfSymbolAtLocation(propSymbol, source);
    for (let depth = 0; depth < 4 && type.flags & ts.TypeFlags.IndexedAccess && type.indexType.isStringLiteral(); depth += 1) {
      const inner = checker.getPropertyOfType(checker.getApparentType(type.objectType), type.indexType.value);
      if (!inner) break;
      type = checker.getTypeOfSymbolAtLocation(inner, source);
    }
    return type;
  };
  const propsTypeOf = (type) => {
    const [param] = type.getCallSignatures()[0]?.getParameters() ?? [];
    return param ? checker.getTypeOfSymbolAtLocation(param, source) : null;
  };

  const moduleExports = checker.getExportsOfModule(moduleSymbol);
  for (const symbol of moduleExports) {
    const name = symbol.getName();
    if (!/^[A-Z]/.test(name) || /^[A-Z0-9_]+$/.test(name)) continue; // components only

    const type = checker.getTypeOfSymbolAtLocation(symbol, source);
    const signatures = type.getCallSignatures();
    if (signatures.length === 0) continue; // not callable — not a component

    const paramType = propsTypeOf(type);
    if (!paramType) continue;

    const props = {};
    const responsiveProps = {};
    const scalars = {};
    const needed = {};
    const own = [];
    const takesMap = [];
    propNames.set(name, new Set(paramType.getProperties().map((p) => p.getName())));
    const fromReact = new Set();
    const dom = new Set();
    for (const propSymbol of paramType.getProperties()) {
      const propName = propSymbol.getName();
      const inherited = isInheritedAttribute(propSymbol);
      if (inherited) fromReact.add(propName);
      if (inherited && !isInertAttribute(propSymbol)) dom.add(propName);
      if (isRedefinedHere(propSymbol, name)) own.push(propName);
      if (!(propSymbol.flags & ts.SymbolFlags.Optional) && propName === "children") needsChildren.add(name);
      if (!(propSymbol.flags & ts.SymbolFlags.Optional) && propName !== "children") {
        needed[propName] = kindOf(typeOfProp(propSymbol));
      }
      // aria-* / data-* / event handlers: other tiers own these. Attributes
      // inherited from React's DOM and SVG types (an svg's `accumulate`, a
      // button's `type`) are the element's, not the component's vocabulary.
      if (propName.startsWith("aria-") || propName.startsWith("data-") || /^on[A-Z]/.test(propName) || inherited) continue;
      const propType = typeOfProp(propSymbol);
      const values = literalUnionValues(propType);
      if (values) {
        // Standard HTML attribute enums inherited from React's DOM types: real
        // unions, but not design-system vocabulary — TypeScript already guards
        // them, and repeating them on ~150 components triples the spec for no
        // validator win.
        if (!DOM_ENUM_PROPS.has(propName)) props[propName] = values;
        continue;
      }
      const responsiveValues = responsiveKeys ? responsiveLiteralValues(propType, checker, source, responsiveKeys) : null;
      if (responsiveValues) {
        responsiveProps[propName] = responsiveValues;
        takesMap.push(propName);
        continue;
      }
      const mixed = responsiveKeys ? responsiveScalarValues(propType, checker, source, responsiveKeys) : null;
      if (mixed && declaredHere(propSymbol)) {
        if (mixed.values.length) responsiveProps[propName] = mixed.values;
        if (mixed.kind) scalars[propName] = mixed.kind;
        takesMap.push(propName);
        continue;
      }
      const kind = kindOf(propType);
      if (declaredHere(propSymbol) && kind !== "other" && !GENERIC_PROPS.has(propName)) scalars[propName] = kind;
    }
    if (Object.keys(props).length) result.set(name, props);
    if (Object.keys(responsiveProps).length) responsive.set(name, responsiveProps);
    if (Object.keys(scalars).length) scalar.set(name, scalars);
    if (takesMap.length) responsiveNames.set(name, new Set(takesMap));
    if (Object.keys(needed).length) required.set(name, needed);
    if (own.length) redefined.set(name, own);
    inheritedProps.set(name, fromReact);
    domAttributes.set(name, dom);

    const { names, found } = documentation(paramType);
    ownProps.set(name, names);
    if (Object.keys(found).length) docs.set(name, found);

    const perPartNames = {};
    const perPartDocs = {};
    for (const partSymbol of type.getProperties()) {
      const part = partSymbol.getName();
      if (!/^[A-Z]/.test(part)) continue;
      const partProps = propsTypeOf(checker.getTypeOfSymbolAtLocation(partSymbol, source));
      if (!partProps) continue;
      const partDoc = documentation(partProps);
      perPartNames[part] = partDoc.names;
      if (Object.keys(partDoc.found).length) perPartDocs[part] = partDoc.found;
    }
    if (Object.keys(perPartNames).length) partOwnProps.set(name, perPartNames);
    if (Object.keys(perPartDocs).length) partDocs.set(name, perPartDocs);
  }
  const exports = moduleExports.map((s) => s.getName()).sort();
  return {
    literal: result, responsive, scalar, takesMap: responsiveNames, required, propNames, redefined, needsChildren,
    ownProps, docs, partOwnProps, partDocs, inherited: inheritedProps, domAttributes, exports,
  };
}

/**
 * React types `color` on every HTML element for the legacy `<font color>`
 * attribute; on the elements the library renders it paints nothing. (An svg's
 * `color` presentation attribute does paint, so only the HTMLAttributes one.)
 */
function isInertAttribute(propSymbol) {
  const declarations = propSymbol.declarations ?? [];
  return propSymbol.getName() === "color" && declarations.length > 0 &&
    declarations.every((d) => ts.isInterfaceDeclaration(d.parent) && d.parent.name.text === "HTMLAttributes");
}

/** Plumbing every component has; documenting it on each would be noise. */
export const UNDOCUMENTED_PROPS = new Set([...GENERIC_PROPS, "ref", "key"]);

/**
 * Declared in the component's own props type (ImageProps, LinkProps…) with a
 * type that takes no responsive map. A style prop always does, so a prop like
 * that is the component's own attribute that happens to share a style prop's name.
 */
function isRedefinedHere(propSymbol, componentName) {
  return (propSymbol.declarations ?? []).some((declaration) => {
    if (!ts.isPropertySignature(declaration) || !declaration.type) return false;
    return declaringTypeName(declaration)?.startsWith(componentName) === true && !/\bResponsive/.test(declaration.type.getText());
  });
}

/** The interface or type alias a property signature is written in, or null. */
function declaringTypeName(declaration) {
  const owner = declaration.parent;
  if (ts.isInterfaceDeclaration(owner)) return owner.name.text;
  if (ts.isTypeLiteralNode(owner) && ts.isTypeAliasDeclaration(owner.parent)) return owner.parent.name.text;
  return null;
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

/**
 * The values of `ResponsiveProp<"a" | "b">`: string literals plus maps whose
 * keys are all responsive keys and whose values are those same literals.
 * Null for anything else, so an open arm still disqualifies.
 */
function responsiveLiteralValues(type, checker, source, responsiveKeys) {
  const nonNullable = type.getNonNullableType();
  if (!nonNullable.isUnion()) return null;
  const values = [];
  const maps = [];
  for (const arm of nonNullable.types) {
    if (arm.isStringLiteral()) values.push(arm.value);
    else if (arm.flags & ts.TypeFlags.Object) maps.push(arm);
    else return null;
  }
  if (new Set(values).size < 2 || maps.length === 0) return null;
  for (const map of maps) {
    const keys = map.getProperties();
    if (keys.length === 0 || map.getCallSignatures().length) return null;
    for (const key of keys) {
      if (!responsiveKeys.has(key.getName())) return null;
      const inner = literalUnionValues(checker.getTypeOfSymbolAtLocation(key, source));
      if (!inner || inner.some((value) => !values.includes(value))) return null;
    }
  }
  return [...new Set(values)];
}

/** "number", "string" or "boolean" for a non-literal scalar arm; null otherwise. */
function scalarArmKind(arm) {
  if (arm.flags & ts.TypeFlags.NumberLike) return "number";
  if (arm.flags & ts.TypeFlags.BooleanLike) return "boolean";
  if (arm.flags & ts.TypeFlags.String) return "string";
  return null;
}

/**
 * A responsive prop that is not a closed vocabulary: a scalar kind, string
 * literals, or both, plus maps over responsive keys holding those same values.
 * Carousel's `slidesPerView` (`number | { base, md… }` of numbers) reads as
 * `{ values: [], kind: "number" }`, Icon's `size` (`"xs".."xl" | number`, or a
 * map of either) as `{ values: ["xs"…], kind: "number" }`. Null for anything
 * else, so an arm of any other kind still disqualifies.
 */
function responsiveScalarValues(type, checker, source, responsiveKeys) {
  const nonNullable = type.getNonNullableType();
  if (!nonNullable.isUnion()) return null;
  const values = [];
  const kinds = new Set();
  const maps = [];
  const readArm = (arm) => {
    if (arm.isStringLiteral()) values.push(arm.value);
    else if (scalarArmKind(arm)) kinds.add(scalarArmKind(arm));
    else return false;
    return true;
  };
  for (const arm of nonNullable.types) {
    if (arm.flags & ts.TypeFlags.Object) maps.push(arm);
    else if (!readArm(arm)) return null;
  }
  if (maps.length === 0 || kinds.size > 1 || (kinds.size === 0 && values.length === 0)) return null;
  const leafFits = (leaf) =>
    leaf.isStringLiteral() ? values.includes(leaf.value) : scalarArmKind(leaf) !== null && kinds.has(scalarArmKind(leaf));
  for (const map of maps) {
    const keys = map.getProperties();
    if (keys.length === 0 || map.getCallSignatures().length) return null;
    for (const key of keys) {
      if (!responsiveKeys.has(key.getName())) return null;
      const leaf = checker.getTypeOfSymbolAtLocation(key, source).getNonNullableType();
      const leaves = leaf.isUnion() && !(leaf.flags & ts.TypeFlags.Boolean) ? leaf.types : [leaf];
      if (!leaves.every(leafFits)) return null;
    }
  }
  return { values: [...new Set(values)], kind: [...kinds][0] ?? null };
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
