/* ==========================================================================
   ASTRALIS — VALIDATOR CORE (Tier A: vocabulary)
   --------------------------------------------------------------------------
   Pure function: (TSX source, system spec) -> { errors, warnings }.

   The system spec (dist/system-spec.json, emitted by the astralis-ui build)
   is the ground truth; nothing here is hand-listed twice. The checks target
   the class of mistakes that TYPECHECK AND STILL FAIL — the compiler's blind
   spot, and the reason retrieval-only AI tooling ships broken output:

   - a component or compound part that doesn't exist        (unknown-import,
                                                              unknown-part)
   - a keyword prop value outside its closed set            (invalid-keyword-value)
   - a breakpoint or state key that isn't one               (invalid-breakpoint-key,
                                                              invalid-state-prop)
   - an `astralis:*` class missing from the compiled CSS —
     it renders as nothing, silently                        (unknown-class)
   - a var(--astralis-*) reference no stylesheet declares   (unknown-css-variable)
   - a prop its component deliberately types away           (excluded-prop)
   - a bare number where CSS needs a unit — same rule the
     runtime warns with, via the spec's unitless flags      (bare-number-value)
   - paint props on recipe components (doctrine, warn-only) (paint-on-recipe)

   Dynamic expressions are skipped, not guessed at: this validator makes no
   claim it cannot decide statically. Components whose spec entry has no
   groups ("props manifest pending") get only the universal checks
   (className, style, existence).
   ========================================================================== */

import { parse } from "@babel/parser";
import { classifyChannelValue } from "./css-value.mjs";
import { ARIA_ATTRS, ROLES } from "./aria.mjs";

const BARE_NUMBER = /^-?(\d+\.?\d*|\.\d+)$/;

/** Nearest token within edit distance 2, for "did you mean" hints. */
function suggestToken(value, tokens) {
  let best = null;
  let bestD = 3;
  for (const t of tokens) {
    if (Math.abs(t.length - value.length) >= bestD) continue;
    const d = editDistance(value, t, bestD);
    if (d < bestD) { bestD = d; best = t; }
  }
  return best;
}

function editDistance(a, b, cap) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (row[j] < rowMin) rowMin = row[j];
    }
    if (rowMin >= cap) return cap;
    prev = row;
  }
  return Math.min(prev[b.length], cap);
}

/* Paint props that recipe components deliberately refuse — the "a component
   owns how it looks" doctrine (utils/placement.ts). Warn-level: the props
   manifest is still partial, so this stays a nudge rather than a verdict.
   `rounded` is NOT here: like `size`, the name is reused as a recipe prop
   (Button/Image radius scale, Tabs boolean) — the docs demos proved it. */
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
    bpKeys: new Set(["base", ...Object.keys(spec.breakpoints)]),
    stateProps: new Set(Object.keys(spec.states)),
  };
}

/** Validate one TSX/JSX source. `prepared` comes from prepareSpec().
 *  opts.strictTokens: additionally warn on every valid-but-off-token color —
 *  the drift check, opt-in because arbitrary values are a feature. */
export function validateSource(source, prepared, filePath = "<source>", opts = {}) {
  const { spec, classSet, varSet, channelVarSet, statePayload, bpKeys, stateProps } = prepared;
  const errors = [];
  const warnings = [];
  const report = (list, code, node, message) =>
    list.push({ code, file: filePath, line: node?.loc?.start.line ?? 0, column: (node?.loc?.start.column ?? 0) + 1, message });

  let ast;
  try {
    ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  } catch (e) {
    report(errors, "parse-error", { loc: e.loc && { start: e.loc } }, `could not parse: ${e.message}`);
    return { errors, warnings };
  }

  /* ---- imports from astralis-ui: local name -> exported name ------------- */
  const imported = new Map();
  for (const node of ast.program.body) {
    if (node.type !== "ImportDeclaration" || node.source.value !== "astralis-ui") continue;
    for (const s of node.specifiers) {
      if (s.type !== "ImportSpecifier") continue;
      const name = s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
      imported.set(s.local.name, name);
      // Only component-shaped names are checkable; hooks/utils aren't in the spec (yet).
      if (/^[A-Z]/.test(name) && !spec.components[name]) {
        report(errors, "unknown-import", s, `"${name}" is not exported by astralis-ui — check the spelling against the components list`);
      }
    }
  }

  /* ---- per-value checks ---------------------------------------------------- */
  const checkScalar = (comp, prop, propSpec, value, node) => {
    if (propSpec.tokens.includes(value)) return;
    if (propSpec.kind === "keyword") {
      const near = suggestToken(value, propSpec.tokens);
      report(errors, "invalid-keyword-value", node,
        `${comp}: "${value}" is not a ${prop} value — keyword props are closed sets` +
        (near ? ` (did you mean "${near}"?)` : ` (valid: ${propSpec.tokens.slice(0, 8).join(", ")}${propSpec.tokens.length > 8 ? ", …" : ""})`));
      return;
    }
    // Channel prop: an arbitrary value rides the var — but it still has to BE
    // a value. The grammar condemns only the definitely-wrong (never valid
    // CSS); everything undecidable passes without a claim.
    if (value === "") {
      report(errors, "empty-channel-value", node, `${comp}: ${prop}="" resolves to nothing`);
      return;
    }
    for (const m of value.matchAll(CSS_VAR_REF)) {
      if (!knownVar(m[1])) {
        report(errors, "unknown-css-variable", node,
          `${comp}: ${prop} references var(${m[1]}), which no token stylesheet declares`);
      }
    }
    const verdict = classifyChannelValue(value, propSpec.valueType ?? "length");
    if (verdict.verdict === "invalid") {
      const near = suggestToken(value, propSpec.tokens);
      report(errors, "channel-value-invalid", node,
        `${comp}: ${prop}="${value}" is neither a token nor valid CSS — ${verdict.reason}` +
        (near ? ` (did you mean "${near}"?)` : ""));
    } else if (verdict.verdict === "bare-number" || (BARE_NUMBER.test(value) && !propSpec.unitless)) {
      report(warnings, "bare-number-value", node,
        `${comp}: ${prop}="${value}" is not a token, and a bare number is not valid CSS here — did you mean a token, or "${value}px"?`);
    } else if (opts.strictTokens && propSpec.valueType === "color") {
      report(warnings, "off-token-color", node,
        `${comp}: ${prop}="${value}" is a raw color — it won't follow the theme or dark mode; prefer a token`);
    }
  };

  // Literal string out of a value node, or null when it's dynamic.
  const literalOf = (v) => {
    if (!v) return null;
    if (v.type === "StringLiteral") return v.value;
    if (v.type === "NumericLiteral") return String(v.value);
    if (v.type === "BooleanLiteral") return String(v.value);
    if (v.type === "TemplateLiteral" && v.expressions.length === 0) return v.quasis[0].value.cooked;
    return null;
  };

  const checkPropValue = (comp, prop, propSpec, valueNode, attr) => {
    if (valueNode === null) {
      // A bare attribute is JSX for {true} — legal exactly when the variant
      // map is boolean-keyed (truncate, gutterBottom, ...).
      if (!propSpec.tokens.includes("true")) {
        report(errors, "invalid-value", attr, `${comp}: ${prop} needs a value`);
      }
      return;
    }
    const direct = literalOf(valueNode);
    if (direct !== null) return checkScalar(comp, prop, propSpec, direct, valueNode);
    if (valueNode.type !== "JSXExpressionContainer") return;
    const expr = valueNode.expression;
    const inner = literalOf(expr);
    if (inner !== null) return checkScalar(comp, prop, propSpec, inner, expr);
    if (expr.type === "ObjectExpression") {
      for (const p of expr.properties) {
        if (p.type !== "ObjectProperty" || p.computed) continue;
        const key = p.key.type === "Identifier" ? p.key.name : p.key.value;
        if (!bpKeys.has(key)) {
          report(errors, "invalid-breakpoint-key", p,
            `${comp}: "${key}" is not a breakpoint — responsive maps take ${["base", ...Object.keys(spec.breakpoints)].join("/")}`);
          continue;
        }
        const v = literalOf(p.value);
        if (v !== null) checkScalar(comp, prop, propSpec, v, p.value);
      }
    }
    // Any other expression is dynamic — no static claim to make.
  };

  const checkStateValue = (comp, state, valueNode, attr) => {
    if (valueNode?.type !== "JSXExpressionContainer" || valueNode.expression.type !== "ObjectExpression") return;
    for (const p of valueNode.expression.properties) {
      if (p.type !== "ObjectProperty" || p.computed) continue;
      const key = p.key.type === "Identifier" ? p.key.name : p.key.value;
      const payloadSpec = statePayload[key];
      if (!payloadSpec) {
        report(errors, "invalid-state-prop", p,
          `${comp}: "${key}" cannot appear in ${state} — states carry channel props only (spacing, sizing, gap, paint, …)`);
        continue;
      }
      const v = literalOf(p.value);
      if (v !== null) checkScalar(comp, `${state}.${key}`, payloadSpec, v, p.value);
    }
  };

  /* ---- universal checks (every element, astralis or not) ------------------ */
  const CSS_VAR_REF = /var\((--astralis-[^,()\s]+)\)/g; // no-fallback form only
  const knownVar = (name) => varSet.has(name) || channelVarSet.has(name);

  const checkClassNameString = (text, node) => {
    for (const token of text.split(/\s+/)) {
      if (token.startsWith("astralis") && !classSet.has(token)) {
        report(errors, "unknown-class", node,
          `class "${token}" does not exist in the compiled CSS — it will silently do nothing`);
      }
    }
  };

  const checkClassName = (attr) => {
    const v = attr.value;
    const direct = literalOf(v) ?? (v?.type === "JSXExpressionContainer" ? literalOf(v.expression) : null);
    if (direct !== null) return checkClassNameString(direct, v);
    const tpl = v?.type === "JSXExpressionContainer" && v.expression.type === "TemplateLiteral" ? v.expression : null;
    if (!tpl) return;
    // Template literal: check whitespace-delimited tokens, dropping any token
    // that touches an expression boundary — those are only partly literal.
    tpl.quasis.forEach((q, i) => {
      const text = q.value.cooked ?? "";
      const parts = text.split(/\s+/);
      if (i > 0 && !/^\s/.test(text)) parts.shift();
      if (i < tpl.expressions.length && !/\s$/.test(text)) parts.pop();
      checkClassNameString(parts.join(" "), q);
    });
  };

  const checkStyle = (attr) => {
    if (attr.value?.type !== "JSXExpressionContainer" || attr.value.expression.type !== "ObjectExpression") return;
    for (const p of attr.value.expression.properties) {
      if (p.type !== "ObjectProperty") continue;
      const key = p.key.type === "StringLiteral" ? p.key.value : null;
      if (key?.startsWith("--astralis-") && !knownVar(key)) {
        report(errors, "unknown-css-variable", p, `"${key}" is not a declared token or channel variable`);
      }
      const v = literalOf(p.value);
      if (v === null) continue;
      for (const m of v.matchAll(CSS_VAR_REF)) {
        if (!knownVar(m[1])) {
          report(errors, "unknown-css-variable", p.value,
            `var(${m[1]}) is not declared by any token stylesheet — the declaration will fall back to nothing`);
        }
      }
    }
  };

  /* ---- one element: identity + every per-attribute check ------------------- */
  // Identity of a JSX element for anatomy purposes:
  //   { display, specName?, owner?, part?, dom? }
  const analyzeOpening = (node) => {
    const identity = { display: null, specName: null, owner: null, part: null, dom: null };

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
      // <Menu.Trigger /> — dot-access validates against the parts the spec
      // enumerated from the real export object. The flat-name guess is NOT a
      // fallback: some compounds are dot-only (no MenuItem export), and a
      // flat cousin existing wouldn't make a missing dot-part render.
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
        report(errors, "unknown-part", node.name,
          `${owner}.${part} — no such part${ownerSpec.parts ? ` (${owner} has: ${ownerSpec.parts.join(", ")})` : ""}`);
      }
    }

    const comp = identity.specName ? spec.components[identity.specName] : null;
    const allowed = {};
    if (comp) for (const g of comp.groups) Object.assign(allowed, spec.propGroups[g]);
    const hasBox = comp ? comp.groups.includes("box") : false;

    let hasSpread = false;
    let hasAlt = false;
    let hasAriaCover = false; // aria-label / aria-labelledby / aria-hidden

    for (const attr of node.attributes) {
      if (attr.type === "JSXSpreadAttribute") { hasSpread = true; continue; }
      if (attr.name.type !== "JSXIdentifier") continue;
      const prop = attr.name.name;

      /* -- universal checks: every element, astralis or not ---------------- */
      if (prop === "className") { checkClassName(attr); continue; }
      if (prop === "style") { checkStyle(attr); continue; }
      if (prop.startsWith("aria-")) {
        hasAriaCover ||= prop === "aria-label" || prop === "aria-labelledby" || prop === "aria-hidden";
        if (!ARIA_ATTRS.has(prop)) {
          const near = suggestToken(prop, [...ARIA_ATTRS]);
          report(errors, "unknown-aria-attribute", attr,
            `"${prop}" is not an ARIA attribute — it renders, and assistive technology hears nothing` +
            (near ? ` (did you mean "${near}"?)` : ""));
        }
        continue;
      }
      if (prop === "role") {
        const value = literalOf(attr.value) ?? (attr.value?.type === "JSXExpressionContainer" ? literalOf(attr.value.expression) : null);
        if (value !== null) {
          for (const token of value.split(/\s+/).filter(Boolean)) {
            if (!ROLES.has(token)) {
              const near = suggestToken(token, [...ROLES]);
              report(errors, "invalid-role", attr,
                `"${token}" is not an ARIA role${near ? ` (did you mean "${near}"?)` : ""}`);
            }
          }
        }
        continue;
      }
      if (prop === "tabIndex") {
        const value = literalOf(attr.value) ?? (attr.value?.type === "JSXExpressionContainer" ? literalOf(attr.value.expression) : null);
        if (value !== null && Number(value) > 0) {
          report(warnings, "positive-tabindex", attr,
            `tabIndex={${value}} hijacks the page's tab order — use 0 (in order) or -1 (programmatic only)`);
        }
        continue;
      }
      if (prop === "alt") { hasAlt = true; continue; }

      /* -- astralis prop checks --------------------------------------------- */
      if (!comp) continue;

      if (comp.exclude?.includes(prop)) {
        const hint =
          identity.specName === "Container" ? " — Container has no size scale; use maxW" :
          prop === "direction" ? ` — the axis is fixed by the preset; use Stack for a switchable direction` : "";
        report(errors, "excluded-prop", attr, `${identity.specName} deliberately has no "${prop}" prop${hint}`);
        continue;
      }
      if (stateProps.has(prop)) {
        // Only Box-composing primitives resolve states; elsewhere no claim.
        if (hasBox) checkStateValue(identity.specName, prop, attr.value, attr);
        continue;
      }
      if (allowed[prop]) {
        checkPropValue(identity.specName, prop, allowed[prop], attr.value, attr);
        continue;
      }
      if (comp.groups.length === 1 && comp.groups[0] === "placement" && DOCTRINE_PAINT_PROPS.has(prop)) {
        report(warnings, "paint-on-recipe", attr,
          `${identity.specName} owns its own ${prop} — paint props stay off recipe components; reach for variant/size/colorScheme instead`);
      }
      // Anything else: DOM prop, recipe prop, or manifest-pending — no claim.
    }

    // Images need a text alternative: real <img>, or our Image wrapper —
    // which jsx-a11y can never know renders an img. Spread props may carry
    // alt, so their presence silences the claim.
    if ((identity.dom === "img" || identity.specName === "Image") && !hasSpread && !hasAlt && !hasAriaCover) {
      report(errors, "missing-alt", node,
        `${identity.display} has no alt — pass alt="…" (or alt="" if purely decorative)`);
    }

    return identity;
  };

  /* ---- anatomy: parts want their compound root above them ------------------ */
  const providesRoot = (ancestor, owner) =>
    ancestor.specName === owner ||
    ancestor.specName === owner + "Root" ||
    (ancestor.owner === owner && ancestor.part === "Root");

  const checkAnatomy = (identity, node, ancestors) => {
    if (!identity.owner || identity.part === "Root") return;
    // Only anatomy CHILDREN are claimed — namespaced variants (Input.Password)
    // and container parts (Radio.Group wraps radios) carry no requirement.
    const anatomy = spec.components[identity.owner]?.anatomy;
    if (!anatomy?.children.includes(identity.part)) return;
    if (ancestors.some((a) => providesRoot(a, identity.owner))) return;
    // Detached subtrees make no claim: a part that IS the expression's root,
    // or sits only under parts of its own compound, is a snippet composed
    // under the real root somewhere else (Playground content, render props).
    if (ancestors.length === 0) return;
    if (ancestors.every((a) => a.owner === identity.owner)) return;
    // Composed under FOREIGN structure with no root in sight — that's the
    // real mistake. Warn, not error: file-local analysis cannot see whether
    // a root wraps this component at its call sites.
    report(warnings, "part-outside-root", node,
      `${identity.display} sits outside a ${identity.owner} in this tree — legal only if a ${identity.owner} wraps this component where it's used`);
  };

  /* ---- Tabs: triggers and panels must speak the same values ---------------- */
  const tabsStack = [];
  const collectTabsValue = (identity, node) => {
    if (tabsStack.length === 0 || identity.owner !== "Tabs") return;
    const scope = tabsStack[tabsStack.length - 1];
    if (identity.part !== "Trigger" && identity.part !== "Content") return;
    const attr = node.attributes.find(
      (a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier" && a.name.name === "value",
    );
    const value = attr
      ? literalOf(attr.value) ?? (attr.value?.type === "JSXExpressionContainer" ? literalOf(attr.value.expression) : null)
      : null;
    if (value === null) { scope.dynamic = true; return; }
    (identity.part === "Trigger" ? scope.triggers : scope.contents).push({ value, node: attr });
  };

  const settleTabs = (scope) => {
    // Any dynamic value and the pairing is not statically decidable.
    if (scope.dynamic || scope.triggers.length === 0 || scope.contents.length === 0) return;
    const triggerValues = new Set(scope.triggers.map((t) => t.value));
    const contentValues = new Set(scope.contents.map((c) => c.value));
    for (const t of scope.triggers) {
      if (!contentValues.has(t.value)) {
        report(errors, "tabs-value-mismatch", t.node,
          `Tabs trigger "${t.value}" has no matching content panel — clicking it shows nothing`);
      }
    }
    for (const c of scope.contents) {
      if (!triggerValues.has(c.value)) {
        report(warnings, "tabs-value-mismatch", c.node,
          `Tabs content "${c.value}" has no trigger — the panel is unreachable`);
      }
    }
    if (scope.defaultValue !== null && !triggerValues.has(scope.defaultValue)) {
      report(errors, "tabs-value-mismatch", scope.node,
        `Tabs defaultValue "${scope.defaultValue}" matches no trigger`);
    }
  };

  /* ---- traversal, carrying JSX ancestry ------------------------------------- */
  const ancestors = [];
  const traverse = (node) => {
    let pushed = false;
    let tabsPushed = false;

    if (node.type === "JSXElement") {
      const opening = node.openingElement;
      const identity = analyzeOpening(opening);
      checkAnatomy(identity, opening, ancestors);
      collectTabsValue(identity, opening);
      if (identity.specName === "Tabs") {
        const attr = opening.attributes.find(
          (a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier" && a.name.name === "defaultValue",
        );
        tabsStack.push({
          triggers: [], contents: [], dynamic: false, node: opening,
          defaultValue: attr ? literalOf(attr.value) ?? (attr.value?.type === "JSXExpressionContainer" ? literalOf(attr.value.expression) : null) : null,
        });
        tabsPushed = true;
      }
      ancestors.push(identity);
      pushed = true;
    }

    for (const key of Object.keys(node)) {
      if (key === "loc") continue;
      const v = node[key];
      if (Array.isArray(v)) {
        for (const c of v) if (c && typeof c.type === "string") traverse(c);
      } else if (v && typeof v.type === "string") {
        traverse(v);
      }
    }

    if (tabsPushed) settleTabs(tabsStack.pop());
    if (pushed) ancestors.pop();
  };
  traverse(ast.program);

  const byPosition = (a, b) => a.line - b.line || a.column - b.column;
  return { errors: errors.sort(byPosition), warnings: warnings.sort(byPosition) };
}
