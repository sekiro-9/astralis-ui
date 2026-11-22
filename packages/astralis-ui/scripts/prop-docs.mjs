/* ==========================================================================
   ASTRALIS — PROP DOCUMENTATION FOR THE SYSTEM SPEC
   --------------------------------------------------------------------------
   What each prop means and what it defaults to, so a tool can explain a prop
   without the docs site. Two sources, both the library's own:

   - the JSDoc on the props types, read off the rolled-up dist/index.d.ts by
     the same checker that reads the vocabularies (extract-literal-props.mjs);
   - for a default the JSDoc does not state, the component's own code: a
     literal in its props destructuring (`size = "md"`), the cva
     `defaultVariants` entry a prop with no destructuring default is passed
     straight into (`tagVariants({ size })`), or a literal attribute written
     before the rest props are spread (`<MenuRoot sideOffset={2} {...props}>`).
     Anything less direct than that (a context fallback, a value computed
     first) yields no default: a wrong default is worse than none.
   ========================================================================== */

import ts from "typescript";

/** Markdown and JSDoc markup reduced to the words a tooltip shows. */
export function plainText(text) {
  return text
    .replace(/\{@link(?:code|plain)?\s+([^}\s|]+)(?:[\s|]+([^}]*))?\}/g, (_, target, label) => (label || target).trim())
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** `{ description?, default?, deprecated? }` from one prop symbol's JSDoc, or
 *  null. The whole comment is kept: the sentences after the first two are
 *  often the caveat (when a prop stops applying), which is what a tool
 *  explaining the prop most needs to say. */
export function jsDocOf(symbol, checker) {
  const doc = {};
  const description = plainText(ts.displayPartsToString(symbol.getDocumentationComment(checker)));
  if (description) doc.description = description;
  for (const tag of symbol.getJsDocTags(checker)) {
    const text = ts.displayPartsToString(tag.text ?? []).replace(/\s+/g, " ").trim();
    if ((tag.name === "default" || tag.name === "defaultValue") && text) doc.default = text;
    if (tag.name === "deprecated" && text) doc.deprecated = plainText(text);
  }
  return Object.keys(doc).length ? doc : null;
}

/* ---- defaults from the component's code ------------------------------------ */

/** A literal initializer as source-style text (`"md"`, `3`, `false`), or null. */
function literalText(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return JSON.stringify(node.text);
  if (ts.isNumericLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return "true";
  if (node.kind === ts.SyntaxKind.FalseKeyword) return "false";
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) {
    return `-${node.operand.text}`;
  }
  return null;
}

const unwrap = (node) => {
  while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node))) {
    node = node.expression;
  }
  return node;
};

/**
 * Reads defaults out of src/: component name -> prop -> default text, plus
 * the same for compound parts that have no flat export (owner -> part -> ...).
 *
 * @param {string} entryPath absolute path to src/index.ts
 * @param {Iterable<string>} names the component exports to read
 * @param {Map<string, string[]>} dotParts owner -> parts to read through the owner
 */
export function extractSourceDefaults(entryPath, names, dotParts) {
  const program = ts.createProgram([entryPath], {
    noEmit: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  });
  const checker = program.getTypeChecker();
  const entry = program.getSourceFile(entryPath);
  if (!entry) throw new Error(`could not load ${entryPath}`);
  const moduleSymbol = checker.getSymbolAtLocation(entry);
  const exported = new Map(checker.getExportsOfModule(moduleSymbol).map((s) => [s.getName(), s]));

  const resolved = (symbol) => (symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol);

  /** The function that renders a component, through identify(), forwardRef(),
   *  memo(), Object.assign(Root, parts) and plain re-bindings. */
  function componentFunction(node, depth = 0) {
    node = unwrap(node);
    if (!node || depth > 10) return null;
    if ((ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isFunctionDeclaration(node)) && node.body) return node;
    if (ts.isVariableDeclaration(node)) return node.initializer ? componentFunction(node.initializer, depth + 1) : null;
    if (ts.isIdentifier(node)) {
      const declaration = resolved(checker.getSymbolAtLocation(node))?.valueDeclaration;
      return declaration ? componentFunction(declaration, depth + 1) : null;
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText();
      if (callee === "Object.assign") return componentFunction(node.arguments[0], depth + 1);
      for (const argument of node.arguments) {
        const found = componentFunction(argument, depth + 1);
        if (found) return found;
      }
    }
    return null;
  }

  /** The object pattern the props are destructured with: the parameter
   *  itself, or `const { … } = props` at the top of the body. */
  function propsPattern(fn) {
    const [param] = fn.parameters;
    if (!param) return null;
    if (ts.isObjectBindingPattern(param.name)) return param.name;
    if (!ts.isIdentifier(param.name) || !fn.body || !ts.isBlock(fn.body)) return null;
    for (const statement of fn.body.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        const init = unwrap(declaration.initializer);
        if (ts.isObjectBindingPattern(declaration.name) && init && ts.isIdentifier(init) && init.text === param.name.text) {
          return declaration.name;
        }
      }
    }
    return null;
  }

  /** `defaultVariants` of the cva a callee identifier names, or null. */
  function defaultVariantsOf(callee) {
    const declaration = resolved(checker.getSymbolAtLocation(callee))?.valueDeclaration;
    const init = declaration && ts.isVariableDeclaration(declaration) ? unwrap(declaration.initializer) : null;
    if (!init || !ts.isCallExpression(init) || init.expression.getText() !== "cva") return null;
    const config = unwrap(init.arguments[1]);
    if (!config || !ts.isObjectLiteralExpression(config)) return null;
    const property = config.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === "defaultVariants");
    const defaults = property && unwrap(property.initializer);
    if (!defaults || !ts.isObjectLiteralExpression(defaults)) return null;
    const out = {};
    for (const p of defaults.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      const text = literalText(unwrap(p.initializer));
      if (text !== null) out[p.name.getText().replace(/^["']|["']$/g, "")] = text;
    }
    return out;
  }

  /** Literal attributes written before `{...rest}` on every element the rest
   *  props are spread onto: `<MenuRoot sideOffset={2} {...props}>`. */
  function spreadDefaults(fn, restName, named) {
    const elements = [];
    const visit = (node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const attributes = node.attributes.properties;
        const at = attributes.findIndex((a) => {
          const spread = ts.isJsxSpreadAttribute(a) ? unwrap(a.expression) : null;
          return spread && ts.isIdentifier(spread) && spread.text === restName;
        });
        if (at !== -1) elements.push(attributes.slice(0, at));
      }
      ts.forEachChild(node, visit);
    };
    visit(fn.body);
    if (!elements.length) return {};
    const literals = elements.map((before) => {
      const found = {};
      for (const a of before) {
        if (!ts.isJsxAttribute(a) || !a.initializer) continue;
        const name = a.name.getText();
        if (named.has(name) || /^(aria|data)-/.test(name)) continue;
        const value = ts.isJsxExpression(a.initializer) ? unwrap(a.initializer.expression) : a.initializer;
        const text = value ? literalText(value) : null;
        if (text !== null) found[name] = text;
      }
      return found;
    });
    const [first, ...others] = literals;
    return Object.fromEntries(Object.entries(first).filter(([name, text]) => others.every((o) => o[name] === text)));
  }

  function defaultsOf(fn) {
    const pattern = propsPattern(fn);
    const [param] = fn.parameters;
    const defaults = {};
    if (!pattern) {
      return param && ts.isIdentifier(param.name) && fn.body ? spreadDefaults(fn, param.name.text, new Set()) : defaults;
    }
    const bare = new Map(); // local binding -> prop, for props destructured with no default
    const named = new Set();
    let restName = null;
    for (const element of pattern.elements) {
      if (element.dotDotDotToken) {
        if (ts.isIdentifier(element.name)) restName = element.name.text;
        continue;
      }
      const key = element.propertyName ?? element.name;
      if (ts.isIdentifier(key) || ts.isStringLiteral(key)) named.add(key.text);
    }
    if (restName && fn.body) Object.assign(defaults, spreadDefaults(fn, restName, named));
    for (const element of pattern.elements) {
      if (element.dotDotDotToken) continue;
      const key = element.propertyName ?? element.name;
      if (!ts.isIdentifier(key) && !ts.isStringLiteral(key)) continue;
      const prop = key.text;
      if (element.initializer) {
        const text = literalText(unwrap(element.initializer));
        if (text !== null) defaults[prop] = text;
      } else if (ts.isIdentifier(element.name)) {
        bare.set(element.name.text, prop);
      }
    }
    if (!bare.size) return defaults;

    // A binding reassigned anywhere in the body no longer carries the prop.
    const reassigned = new Set();
    const fromCva = new Map(); // prop -> Set of defaults seen
    const visit = (node) => {
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(node.left)) {
        reassigned.add(node.left.text);
      }
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.arguments.length === 1) {
        const arg = unwrap(node.arguments[0]);
        const variants = arg && ts.isObjectLiteralExpression(arg) ? defaultVariantsOf(node.expression) : null;
        if (variants) {
          for (const p of arg.properties) {
            const local = ts.isShorthandPropertyAssignment(p)
              ? p.name.text
              : ts.isPropertyAssignment(p) && ts.isIdentifier(unwrap(p.initializer))
                ? unwrap(p.initializer).text
                : null;
            const variant = p.name && ts.isIdentifier(p.name) ? p.name.text : null;
            const prop = local && bare.get(local);
            if (!prop || !variant || !(variant in variants)) continue;
            if (!fromCva.has(prop)) fromCva.set(prop, new Set());
            fromCva.get(prop).add(variants[variant]);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    if (fn.body) visit(fn.body);
    for (const [prop, seen] of fromCva) {
      const local = [...bare].find(([, p]) => p === prop)[0];
      if (seen.size === 1 && !reassigned.has(local)) defaults[prop] = [...seen][0];
    }
    return defaults;
  }

  const components = new Map();
  for (const name of names) {
    const symbol = resolved(exported.get(name));
    const fn = symbol?.valueDeclaration ? componentFunction(symbol.valueDeclaration) : null;
    const defaults = fn ? defaultsOf(fn) : {};
    if (Object.keys(defaults).length) components.set(name, defaults);
  }

  const parts = new Map();
  for (const [owner, partNames] of dotParts) {
    const symbol = resolved(exported.get(owner));
    if (!symbol?.valueDeclaration) continue;
    const ownerType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
    const perPart = {};
    for (const part of partNames) {
      const declaration = ownerType.getProperty(part)?.valueDeclaration;
      const target = declaration && ts.isPropertyAssignment(declaration)
        ? declaration.initializer
        : declaration && ts.isShorthandPropertyAssignment(declaration)
          ? resolved(checker.getShorthandAssignmentValueSymbol(declaration))?.valueDeclaration
          : null;
      const fn = target ? componentFunction(target) : null;
      const defaults = fn ? defaultsOf(fn) : {};
      if (Object.keys(defaults).length) perPart[part] = defaults;
    }
    if (Object.keys(perPart).length) parts.set(owner, perPart);
  }
  return { components, parts };
}
