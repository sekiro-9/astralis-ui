import { parse } from "@babel/parser";
import { clientTier, keptText, narrowProps, redactedText } from "./snapshot.mjs";

/* The component tree `astralis report` records from source files: the
   astralis-ui elements in their JSX, with literal props only. The DevTools
   build the same tree from the rendered page (astralis-devtools). */

const PARSE_OPTIONS = { sourceType: "module", plugins: ["typescript", "jsx"] };

/** local name -> astralis-ui export, for value imports from astralis-ui. */
function importsOf(ast) {
  const imported = new Map();
  for (const node of ast.program.body) {
    if (node.type !== "ImportDeclaration" || node.source.value !== "astralis-ui" || node.importKind === "type") continue;
    for (const s of node.specifiers) {
      if (s.type !== "ImportSpecifier" || s.importKind === "type") continue;
      imported.set(s.local.name, s.imported.type === "Identifier" ? s.imported.name : s.imported.value);
    }
  }
  return imported;
}

/** The public name of a JSX element if it is an astralis-ui component, else null. */
function publicName(nameNode, imported, spec) {
  if (nameNode.type === "JSXIdentifier") {
    const exported = imported.get(nameNode.name);
    if (!exported || !spec.components?.[exported]) return null;
    // A flat part export (CardBody) is written the way the page names it: Card.Body.
    const partOf = spec.components[exported].partOf;
    return partOf ? `${partOf}.${exported.slice(partOf.length)}` : exported;
  }
  if (nameNode.type === "JSXMemberExpression" && nameNode.object.type === "JSXIdentifier") {
    const owner = imported.get(nameNode.object.name);
    if (!owner || !spec.components?.[owner]) return null;
    const name = `${owner}.${nameNode.property.name}`;
    return spec.components[owner].parts?.includes(nameNode.property.name) ? name : null;
  }
  return null;
}

/** A literal attribute value, or undefined when it is computed at run time. */
function literal(node) {
  if (!node) return true; // <Button disabled />
  if (node.type === "JSXExpressionContainer") return literal(node.expression);
  if (node.type === "StringLiteral") return node.value;
  if (node.type === "NumericLiteral" || node.type === "BooleanLiteral") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) return node.quasis[0].value.cooked;
  if (node.type === "UnaryExpression" && node.operator === "-" && node.argument.type === "NumericLiteral") return -node.argument.value;
  if (node.type === "ObjectExpression") {
    const out = {};
    for (const p of node.properties) {
      if (p.type !== "ObjectProperty" || p.computed) return undefined;
      const key = p.key.type === "Identifier" ? p.key.name : p.key.value;
      const value = literal(p.value);
      if (value === undefined) return undefined;
      out[key] = value;
    }
    return out;
  }
  return undefined;
}

function propsOf(opening) {
  const props = {};
  for (const attr of opening.attributes) {
    if (attr.type !== "JSXAttribute" || attr.name.type !== "JSXIdentifier") continue;
    const value = literal(attr.value);
    if (value !== undefined) props[attr.name.name] = value;
  }
  return props;
}

function childrenOf(nodes, ctx) {
  const out = [];
  for (const child of nodes) {
    if (child.type === "JSXText") {
      const text = child.value.replace(/\s+/g, " ").trim();
      if (text) out.push(ctx.includeText ? keptText(text) : redactedText(text));
    } else if (child.type === "JSXExpressionContainer") {
      const value = literal(child.expression);
      if (typeof value === "string" && value.trim()) out.push(ctx.includeText ? keptText(value.trim()) : redactedText(value.trim()));
    } else if (child.type === "JSXElement" || child.type === "JSXFragment") {
      out.push(...elementNodes(child, ctx));
    }
  }
  return out;
}

/** An element as tree nodes: itself when it is an astralis-ui component, else what it contains. */
function elementNodes(node, ctx) {
  if (node.type === "JSXFragment") return childrenOf(node.children, ctx);
  const name = publicName(node.openingElement.name, ctx.imported, ctx.spec);
  if (!name) return childrenOf(node.children, ctx);
  return [{
    component: name,
    props: narrowProps(ctx.spec, name, propsOf(node.openingElement)),
    client: clientTier(ctx.spec, name),
    children: childrenOf(node.children, ctx),
  }];
}

/** Every outermost JSX element or fragment in the file, in source order. */
function outermostJsx(ast) {
  const found = [];
  const walk = (node) => {
    if (!node || typeof node.type !== "string") return;
    if (node.type === "JSXElement" || node.type === "JSXFragment") {
      found.push(node);
      return;
    }
    for (const key of Object.keys(node)) {
      if (key === "loc") continue;
      const value = node[key];
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object") walk(value);
    }
  };
  walk(ast.program);
  return found;
}

/**
 * The astralis-ui components in one source file, outermost first. Throws a
 * SyntaxError when the file does not parse. Text becomes placeholders unless
 * `includeText` is set.
 */
export function treeFromSource(source, spec, { includeText = false } = {}) {
  const ast = parse(source, PARSE_OPTIONS);
  const ctx = { spec, imported: importsOf(ast), includeText };
  // Text outside every component belongs to no component; the tree starts at components.
  return outermostJsx(ast)
    .flatMap((node) => elementNodes(node, ctx))
    .filter((node) => "component" in node);
}
