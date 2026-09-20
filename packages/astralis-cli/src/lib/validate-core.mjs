/* ==========================================================================
   ASTRALIS — VALIDATOR CORE (Tier A: vocabulary)
   --------------------------------------------------------------------------
   Pure function: (TSX source, system spec) -> { errors, warnings }. Browser-
   safe: it reaches no Node builtins, so it also runs client-side.

   The system spec (dist/system-spec.json, emitted by the astralis-ui build)
   is the ground truth; nothing here is hand-listed twice. The checks target
   the class of mistakes that TYPECHECK AND STILL FAIL:

   - a component or compound part that doesn't exist        (unknown-import,
                                                              unknown-part)
   - a keyword prop value outside its closed set            (invalid-keyword-value)
   - a breakpoint or state key that isn't one               (invalid-breakpoint-key,
                                                              invalid-state-prop)
   - an `astralis:*` class missing from the compiled CSS    (unknown-class)
   - a var(--astralis-*) reference no stylesheet declares   (unknown-css-variable)
   - a prop its component deliberately types away           (excluded-prop)
   - a bare number where CSS needs a unit                   (bare-number-value)
   - paint props on recipe components (doctrine, warn-only) (paint-on-recipe)
   - a component left empty that its type requires children for (missing-children):
     tsc catches it too, but agents and copied snippets produce code no one type-checks

   Dynamic expressions are skipped, not guessed at: this validator makes no
   claim it cannot decide statically. Components whose spec entry has no
   groups ("props manifest pending") get only the universal checks.
   ========================================================================== */

import { parse } from "@babel/parser";
import { classifyChannelValue } from "./css-value.mjs";
import { ARIA_ATTRS, ROLES } from "./aria.mjs";
import { suggest } from "./suggest.mjs";
import { checkRequiredChildren } from "./children-rule.mjs";

const BARE_NUMBER = /^-?(\d+\.?\d*|\.\d+)$/;
const CSS_VAR_REF = /var\((--astralis-[^,()\s]+)\)/g; // no-fallback form only

/* Paint props that recipe components deliberately refuse — the "a component
   owns how it looks" doctrine (utils/placement.ts). Warn-level while the
   props manifest is partial. `rounded` is NOT here: like `size`, the name is
   reused as a recipe prop (Button/Image radius scale, Tabs boolean). */
const DOCTRINE_PAINT_PROPS = new Set([
  "p", "px", "py", "pt", "pr", "pb", "pl",
  "bg", "borderColor", "shadow",
]);

/** Precompute the lookup tables one spec produces. Reusable across files. */
export function prepareSpec(spec) {
  const classSet = new Set(spec.classes);
  const varSet = new Set(spec.cssVariables);

  // Channel custom properties are legal style keys/references even though no
  // token stylesheet declares them: --astralis-p, --astralis-p-md, --astralis-p-hover.
  const channelVarSet = new Set();
  const suffixes = ["", ...Object.keys(spec.breakpoints), ...Object.values(spec.states)];
  for (const slug of Object.values(spec.channelProps)) {
    for (const s of suffixes) channelVarSet.add(s ? `--astralis-${slug}-${s}` : `--astralis-${slug}`);
  }

  // What a state object may carry: box's channel props plus the gap family.
  const statePayload = {};
  for (const name of spec.stateableProps) {
    statePayload[name] = spec.propGroups.box[name] ?? spec.propGroups.flex[name];
  }

  return {
    spec,
    classSet,
    varSet,
    channelVarSet,
    statePayload,
    // Container keys (@sm..@xl) are additive in the spec; older specs lack
    // them and older code must keep validating.
    bpKeys: new Set(["base", ...Object.keys(spec.breakpoints), ...Object.keys(spec.containerBreakpoints ?? {})]),
    stateProps: new Set(Object.keys(spec.states)),
    // Every exported value and type (spec 3+). Null for older specs.
    exportSet: spec.exports ? new Set(spec.exports) : null,
  };
}

/**
 * Whether astralis-ui exports `name`. Specs before version 3 list only
 * components, so constants (COLOR_SCHEMES) and props types (ButtonProps) are
 * given the benefit of the doubt there rather than reported.
 */
function isExported(ctx, name) {
  if (ctx.spec.components[name]) return true;
  return ctx.exportSet ? ctx.exportSet.has(name) : /^[A-Z0-9_]+$|Props$/.test(name);
}

/* ---- AST helpers ------------------------------------------------------------ */

/** Literal string out of a value node, or null when it's dynamic. */
function literalOf(v) {
  if (!v) return null;
  if (v.type === "StringLiteral") return v.value;
  if (v.type === "NumericLiteral") return String(v.value);
  if (v.type === "BooleanLiteral") return String(v.value);
  if (v.type === "TemplateLiteral" && v.expressions.length === 0) return v.quasis[0].value.cooked;
  return null;
}

/** A JSX attribute value's literal, written either `x="…"` or `x={"…"}`; null when dynamic. */
function attributeLiteral(value) {
  return literalOf(value) ?? (value?.type === "JSXExpressionContainer" ? literalOf(value.expression) : null);
}

const keyName = (property) => (property.key.type === "Identifier" ? property.key.name : property.key.value);

function findAttribute(opening, name) {
  return opening.attributes.find(
    (a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier" && a.name.name === name,
  );
}

/** "did you mean" for a near miss, else the start of the closed set. */
function closedSetHint(value, values) {
  const near = suggest(value, values);
  if (near) return ` (did you mean "${near}"?)`;
  return ` (valid: ${values.slice(0, 8).join(", ")}${values.length > 8 ? ", …" : ""})`;
}

/* ---- per-file context ----------------------------------------------------------- */

function createContext(prepared, filePath, opts) {
  const errors = [];
  const warnings = [];
  const report = (list, code, node, message) =>
    list.push({ code, file: filePath, line: node?.loc?.start.line ?? 0, column: (node?.loc?.start.column ?? 0) + 1, message });
  return {
    ...prepared,
    opts,
    errors,
    warnings,
    error: (code, node, message) => report(errors, code, node, message),
    warn: (code, node, message) => report(warnings, code, node, message),
    knownVar: (name) => prepared.varSet.has(name) || prepared.channelVarSet.has(name),
    imported: new Map(), // local name -> astralis-ui export name
    ancestors: [], // JSX identities above the current node
    tabsStack: [], // open <Tabs> scopes
  };
}

/* ---- rule: imports from astralis-ui ------------------------------------------- */

function collectImports(ctx, ast) {
  for (const node of ast.program.body) {
    if (node.type !== "ImportDeclaration" || node.source.value !== "astralis-ui") continue;
    for (const s of node.specifiers) {
      if (s.type !== "ImportSpecifier" || s.importKind === "type" || node.importKind === "type") continue;
      const name = s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
      ctx.imported.set(s.local.name, name);
      // Only capitalised names are checked: a lowercase hook or util typo is TypeScript's to catch.
      if (/^[A-Z]/.test(name) && !isExported(ctx, name)) {
        ctx.error("unknown-import", s, `"${name}" is not exported by astralis-ui — check the spelling against the components list`);
      }
    }
  }
}

/* ---- rule: prop values ---------------------------------------------------------- */

function checkScalar(ctx, comp, prop, propSpec, value, node) {
  if (propSpec.tokens.includes(value)) return;
  if (propSpec.kind === "keyword") {
    ctx.error("invalid-keyword-value", node,
      `${comp}: "${value}" is not a ${prop} value — keyword props are closed sets` + closedSetHint(value, propSpec.tokens));
    return;
  }
  // Channel prop: an arbitrary value rides the var, but it still has to BE a
  // value. The grammar condemns only the definitely-wrong.
  if (value === "") {
    ctx.error("empty-channel-value", node, `${comp}: ${prop}="" resolves to nothing`);
    return;
  }
  for (const m of value.matchAll(CSS_VAR_REF)) {
    if (!ctx.knownVar(m[1])) {
      ctx.error("unknown-css-variable", node, `${comp}: ${prop} references var(${m[1]}), which no token stylesheet declares`);
    }
  }
  const verdict = classifyChannelValue(value, propSpec.valueType ?? "length");
  if (verdict.verdict === "invalid") {
    const near = suggest(value, propSpec.tokens);
    ctx.error("channel-value-invalid", node,
      `${comp}: ${prop}="${value}" is neither a token nor valid CSS — ${verdict.reason}` +
      (near ? ` (did you mean "${near}"?)` : ""));
  } else if (verdict.verdict === "bare-number" || (BARE_NUMBER.test(value) && !propSpec.unitless)) {
    ctx.warn("bare-number-value", node,
      `${comp}: ${prop}="${value}" is not a token, and a bare number is not valid CSS here — did you mean a token, or "${value}px"?`);
  } else if (ctx.opts.strictTokens && propSpec.valueType === "color") {
    ctx.warn("off-token-color", node,
      `${comp}: ${prop}="${value}" is a raw color — it won't follow the theme or dark mode; prefer a token`);
  }
}

function checkPropValue(ctx, comp, prop, propSpec, valueNode, attr) {
  if (valueNode === null) {
    // A bare attribute is JSX for {true}: legal exactly when the variant map is boolean-keyed.
    if (!propSpec.tokens.includes("true")) ctx.error("invalid-value", attr, `${comp}: ${prop} needs a value`);
    return;
  }
  const direct = literalOf(valueNode);
  if (direct !== null) return checkScalar(ctx, comp, prop, propSpec, direct, valueNode);
  if (valueNode.type !== "JSXExpressionContainer") return;
  const expr = valueNode.expression;
  const inner = literalOf(expr);
  if (inner !== null) return checkScalar(ctx, comp, prop, propSpec, inner, expr);
  if (expr.type !== "ObjectExpression") return; // any other expression is dynamic

  for (const p of expr.properties) {
    if (p.type !== "ObjectProperty" || p.computed) continue;
    const key = keyName(p);
    if (!ctx.bpKeys.has(key)) {
      const keys = ["base", ...Object.keys(ctx.spec.breakpoints), ...Object.keys(ctx.spec.containerBreakpoints ?? {})];
      ctx.error("invalid-breakpoint-key", p, `${comp}: "${key}" is not a breakpoint — responsive maps take ${keys.join("/")}`);
      continue;
    }
    const v = literalOf(p.value);
    if (v !== null) checkScalar(ctx, comp, prop, propSpec, v, p.value);
  }
}

function checkStateValue(ctx, comp, state, valueNode) {
  if (valueNode?.type !== "JSXExpressionContainer" || valueNode.expression.type !== "ObjectExpression") return;
  for (const p of valueNode.expression.properties) {
    if (p.type !== "ObjectProperty" || p.computed) continue;
    const key = keyName(p);
    const payloadSpec = ctx.statePayload[key];
    if (!payloadSpec) {
      ctx.error("invalid-state-prop", p,
        `${comp}: "${key}" cannot appear in ${state} — states carry channel props only (spacing, sizing, gap, paint, …)`);
      continue;
    }
    const v = literalOf(p.value);
    if (v !== null) checkScalar(ctx, comp, `${state}.${key}`, payloadSpec, v, p.value);
  }
}

/* ---- rules: universal attributes (every element, astralis or not) ------------- */

function checkClassNameString(ctx, text, node) {
  for (const token of text.split(/\s+/)) {
    if (token.startsWith("astralis") && !ctx.classSet.has(token)) {
      ctx.error("unknown-class", node, `class "${token}" does not exist in the compiled CSS — it will silently do nothing`);
    }
  }
}

function checkClassName(ctx, attr) {
  const v = attr.value;
  const direct = attributeLiteral(v);
  if (direct !== null) return checkClassNameString(ctx, direct, v);
  const tpl = v?.type === "JSXExpressionContainer" && v.expression.type === "TemplateLiteral" ? v.expression : null;
  if (!tpl) return;
  // Check whitespace-delimited tokens, dropping any that touch an expression: those are only partly literal.
  tpl.quasis.forEach((q, i) => {
    const text = q.value.cooked ?? "";
    const parts = text.split(/\s+/);
    if (i > 0 && !/^\s/.test(text)) parts.shift();
    if (i < tpl.expressions.length && !/\s$/.test(text)) parts.pop();
    checkClassNameString(ctx, parts.join(" "), q);
  });
}

function checkStyle(ctx, attr) {
  if (attr.value?.type !== "JSXExpressionContainer" || attr.value.expression.type !== "ObjectExpression") return;
  for (const p of attr.value.expression.properties) {
    if (p.type !== "ObjectProperty") continue;
    const key = p.key.type === "StringLiteral" ? p.key.value : null;
    if (key?.startsWith("--astralis-") && !ctx.knownVar(key)) {
      ctx.error("unknown-css-variable", p, `"${key}" is not a declared token or channel variable`);
    }
    const v = literalOf(p.value);
    if (v === null) continue;
    for (const m of v.matchAll(CSS_VAR_REF)) {
      if (!ctx.knownVar(m[1])) {
        ctx.error("unknown-css-variable", p.value,
          `var(${m[1]}) is not declared by any token stylesheet — the declaration will fall back to nothing`);
      }
    }
  }
}

function checkAriaAttribute(ctx, attr, prop) {
  if (ARIA_ATTRS.has(prop)) return;
  const near = suggest(prop, [...ARIA_ATTRS]);
  ctx.error("unknown-aria-attribute", attr,
    `"${prop}" is not an ARIA attribute — it renders, and assistive technology hears nothing` +
    (near ? ` (did you mean "${near}"?)` : ""));
}

function checkRole(ctx, attr) {
  const value = attributeLiteral(attr.value);
  if (value === null) return;
  for (const token of value.split(/\s+/).filter(Boolean)) {
    if (ROLES.has(token)) continue;
    const near = suggest(token, [...ROLES]);
    ctx.error("invalid-role", attr, `"${token}" is not an ARIA role${near ? ` (did you mean "${near}"?)` : ""}`);
  }
}

function checkTabIndex(ctx, attr) {
  const value = attributeLiteral(attr.value);
  if (value !== null && Number(value) > 0) {
    ctx.warn("positive-tabindex", attr,
      `tabIndex={${value}} hijacks the page's tab order — use 0 (in order) or -1 (programmatic only)`);
  }
}

/* ---- rule: astralis component props --------------------------------------------- */

function checkComponentProp(ctx, identity, comp, allowed, attr, prop) {
  const name = identity.specName;
  if (comp.exclude?.includes(prop)) {
    const short = allowed[prop]?.short;
    const hint =
      name === "Container" ? " — Container has no size scale; use maxW" :
      prop === "direction" ? ` — the axis is fixed by the preset; use Stack for a switchable direction` :
      short && !comp.exclude.includes(short) ? ` — use ${short}` : "";
    ctx.error("excluded-prop", attr, `${name} has no "${prop}" prop${hint}`);
    return;
  }
  // The component's own attribute under a style prop's name (Image's width): not a style prop.
  if (comp.overrides?.includes(prop)) return;
  if (ctx.stateProps.has(prop)) {
    // Only Box-composing primitives resolve states; elsewhere no claim.
    if (comp.groups.includes("box")) checkStateValue(ctx, name, prop, attr.value);
    return;
  }
  if (allowed[prop]) {
    checkPropValue(ctx, name, prop, allowed[prop], attr.value, attr);
    return;
  }
  // Recipe props (Button variant, Alert status, …): closed vocabularies read
  // out of the shipped d.ts. Literal values only; dynamic ones are TypeScript's.
  if (comp.props?.[prop]) {
    const values = comp.props[prop];
    const value = attributeLiteral(attr.value);
    if (value !== null && !values.includes(value)) {
      ctx.error("invalid-recipe-value", attr, `${name}: "${value}" is not a ${prop} value` + closedSetHint(value, values));
    }
    return;
  }
  if (comp.groups.length === 1 && comp.groups[0] === "placement" && DOCTRINE_PAINT_PROPS.has(prop)) {
    ctx.warn("paint-on-recipe", attr,
      `${name} owns its own ${prop} — paint props stay off recipe components; reach for variant/size/colorScheme instead`);
  }
  // Anything else: DOM prop or open-typed — no claim.
}

/* ---- one element: identity, then every attribute ----------------------------- */

/** Who a JSX element is, for anatomy: { display, specName, owner, part, dom }. */
function resolveIdentity(ctx, node) {
  const identity = { display: null, specName: null, owner: null, part: null, dom: null };
  const { spec, imported } = ctx;

  if (node.name.type === "JSXIdentifier") {
    const local = node.name.name;
    identity.display = local;
    if (/^[a-z]/.test(local)) identity.dom = local;
    const specName = imported.get(local) ?? null;
    if (specName && spec.components[specName]) {
      identity.specName = specName;
      // A flat part export (CardBody) knows its compound via partOf.
      const partOf = spec.components[specName].partOf;
      if (partOf) {
        identity.owner = partOf;
        identity.part = specName.slice(partOf.length);
      }
    }
  } else if (
    node.name.type === "JSXMemberExpression" &&
    node.name.object.type === "JSXIdentifier" &&
    imported.has(node.name.object.name)
  ) {
    // <Menu.Trigger /> validates against the parts the spec enumerated from
    // the real export object. The flat-name guess is NOT a fallback: some
    // compounds are dot-only, and a flat cousin wouldn't make a dot-part render.
    const owner = imported.get(node.name.object.name);
    const part = node.name.property.name;
    identity.display = `${owner}.${part}`;
    const ownerSpec = spec.components[owner];
    if (ownerSpec?.parts?.includes(part)) {
      identity.owner = owner;
      identity.part = part;
      // A part with a flat twin (CardBody) carries that twin's groups.
      if (spec.components[owner + part]) identity.specName = owner + part;
    } else if (ownerSpec) {
      ctx.error("unknown-part", node.name,
        `${owner}.${part} — no such part${ownerSpec.parts ? ` (${owner} has: ${ownerSpec.parts.join(", ")})` : ""}`);
    }
  }
  return identity;
}

function analyzeOpening(ctx, node) {
  const identity = resolveIdentity(ctx, node);
  const comp = identity.specName ? ctx.spec.components[identity.specName] : null;
  const allowed = {};
  if (comp) for (const g of comp.groups) Object.assign(allowed, ctx.spec.propGroups[g]);

  let hasSpread = false;
  let hasAlt = false;
  let hasAriaCover = false; // aria-label / aria-labelledby / aria-hidden

  for (const attr of node.attributes) {
    if (attr.type === "JSXSpreadAttribute") { hasSpread = true; continue; }
    if (attr.name.type !== "JSXIdentifier") continue;
    const prop = attr.name.name;

    if (prop === "className") checkClassName(ctx, attr);
    else if (prop === "style") checkStyle(ctx, attr);
    else if (prop.startsWith("aria-")) {
      hasAriaCover ||= prop === "aria-label" || prop === "aria-labelledby" || prop === "aria-hidden";
      checkAriaAttribute(ctx, attr, prop);
    } else if (prop === "role") checkRole(ctx, attr);
    else if (prop === "tabIndex") checkTabIndex(ctx, attr);
    else if (prop === "alt") hasAlt = true;
    else if (comp) checkComponentProp(ctx, identity, comp, allowed, attr, prop);
  }

  // Images need a text alternative: real <img>, or our Image wrapper (which
  // jsx-a11y can't know renders an img). A spread may carry alt, so it silences the claim.
  if ((identity.dom === "img" || identity.specName === "Image") && !hasSpread && !hasAlt && !hasAriaCover) {
    ctx.error("missing-alt", node, `${identity.display} has no alt — pass alt="…" (or alt="" if purely decorative)`);
  }
  return identity;
}

/* ---- rule: anatomy — parts want their compound root above them ------------------ */

const providesRoot = (ancestor, owner) =>
  ancestor.specName === owner ||
  ancestor.specName === owner + "Root" ||
  (ancestor.owner === owner && ancestor.part === "Root");

function checkAnatomy(ctx, identity, node) {
  if (!identity.owner || identity.part === "Root") return;
  // Only anatomy CHILDREN are claimed: namespaced variants (Input.Password)
  // and container parts (Radio.Group) carry no requirement.
  const anatomy = ctx.spec.components[identity.owner]?.anatomy;
  if (!anatomy?.children.includes(identity.part)) return;
  const { ancestors } = ctx;
  if (ancestors.some((a) => providesRoot(a, identity.owner))) return;
  // A detached subtree (the expression's root, or only under its own
  // compound's parts) is composed under the real root elsewhere: no claim.
  if (ancestors.length === 0) return;
  if (ancestors.every((a) => a.owner === identity.owner)) return;
  // Under FOREIGN structure with no root in sight. Warn: file-local analysis
  // can't see whether a root wraps this component at its call sites.
  ctx.warn("part-outside-root", node,
    `${identity.display} sits outside a ${identity.owner} in this tree — legal only if a ${identity.owner} wraps this component where it's used`);
}

/* ---- rule: Tabs triggers and panels must speak the same values ------------------ */

function openTabsScope(ctx, opening) {
  const attr = findAttribute(opening, "defaultValue");
  ctx.tabsStack.push({
    triggers: [],
    contents: [],
    dynamic: false,
    node: opening,
    defaultValue: attr ? attributeLiteral(attr.value) : null,
  });
}

function collectTabsValue(ctx, identity, node) {
  if (ctx.tabsStack.length === 0 || identity.owner !== "Tabs") return;
  if (identity.part !== "Trigger" && identity.part !== "Content") return;
  const scope = ctx.tabsStack.at(-1);
  const attr = findAttribute(node, "value");
  const value = attr ? attributeLiteral(attr.value) : null;
  if (value === null) { scope.dynamic = true; return; }
  (identity.part === "Trigger" ? scope.triggers : scope.contents).push({ value, node: attr });
}

function settleTabs(ctx, scope) {
  // Any dynamic value and the pairing is not statically decidable.
  if (scope.dynamic || scope.triggers.length === 0 || scope.contents.length === 0) return;
  const triggerValues = new Set(scope.triggers.map((t) => t.value));
  const contentValues = new Set(scope.contents.map((c) => c.value));
  for (const t of scope.triggers) {
    if (!contentValues.has(t.value)) {
      ctx.error("tabs-value-mismatch", t.node, `Tabs trigger "${t.value}" has no matching content panel — clicking it shows nothing`);
    }
  }
  for (const c of scope.contents) {
    if (!triggerValues.has(c.value)) {
      ctx.warn("tabs-value-mismatch", c.node, `Tabs content "${c.value}" has no trigger — the panel is unreachable`);
    }
  }
  if (scope.defaultValue !== null && !triggerValues.has(scope.defaultValue)) {
    ctx.error("tabs-value-mismatch", scope.node, `Tabs defaultValue "${scope.defaultValue}" matches no trigger`);
  }
}

/* ---- traversal, carrying JSX ancestry ------------------------------------------- */

function traverse(ctx, node) {
  let pushed = false;
  let tabsPushed = false;

  if (node.type === "JSXElement") {
    const opening = node.openingElement;
    const identity = analyzeOpening(ctx, opening);
    checkAnatomy(ctx, identity, opening);
    checkRequiredChildren(ctx, identity, node);
    collectTabsValue(ctx, identity, opening);
    if (identity.specName === "Tabs") {
      openTabsScope(ctx, opening);
      tabsPushed = true;
    }
    ctx.ancestors.push(identity);
    pushed = true;
  }

  for (const key of Object.keys(node)) {
    if (key === "loc") continue;
    const v = node[key];
    if (Array.isArray(v)) {
      for (const c of v) if (c && typeof c.type === "string") traverse(ctx, c);
    } else if (v && typeof v.type === "string") {
      traverse(ctx, v);
    }
  }

  if (tabsPushed) settleTabs(ctx, ctx.tabsStack.pop());
  if (pushed) ctx.ancestors.pop();
}

/** Validate one TSX/JSX source. `prepared` comes from prepareSpec().
 *  opts.strictTokens: additionally warn on every valid-but-off-token color —
 *  the drift check, opt-in because arbitrary values are a feature. */
export function validateSource(source, prepared, filePath = "<source>", opts = {}) {
  const ctx = createContext(prepared, filePath, opts);

  let ast;
  try {
    ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  } catch (e) {
    ctx.error("parse-error", { loc: e.loc && { start: e.loc } }, `could not parse: ${e.message}`);
    return { errors: ctx.errors, warnings: ctx.warnings };
  }

  collectImports(ctx, ast);
  traverse(ctx, ast.program);

  const byPosition = (a, b) => a.line - b.line || a.column - b.column;
  return { errors: ctx.errors.sort(byPosition), warnings: ctx.warnings.sort(byPosition) };
}
