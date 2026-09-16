import { jsLiteral } from "./codegen";

/**
 * Writing a React element tree back out as the JSX that produces it.
 *
 * A playground fixture used to carry its JSX twice: once as the element that
 * renders on the stage, once as a hand-typed `source` string for the generated
 * code. Nothing tied the two together, so they could disagree silently. This
 * derives the second from the first, which leaves one description to review.
 *
 * Pure and React-free: elements are read structurally (`type`, `props`), and
 * the caller supplies `nameOf`, which maps a component reference to the name
 * its JSX tag should carry (`Modal.Trigger`, `Button`).
 */

/**
 * `within` lists the compound roots enclosing the element, nearest first. A
 * part shared between compounds (Drawer reuses Modal's `Title`) is then named
 * for the one it sits in.
 */
export type NameOf = (type: unknown, within: readonly string[]) => string | null;

interface ElementLike {
  type: unknown;
  props: Record<string, unknown>;
}

const FRAGMENT = Symbol.for("react.fragment");

function isElement(value: unknown): value is ElementLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "$$typeof" in value &&
    "type" in value &&
    "props" in value
  );
}

/** Children in render order, with nested arrays and fragments flattened. */
function flatten(children: unknown, out: unknown[] = []): unknown[] {
  if (Array.isArray(children)) {
    for (const child of children) flatten(child, out);
  } else if (isElement(children) && children.type === FRAGMENT) {
    flatten(children.props.children, out);
  } else if (children !== null && children !== undefined && typeof children !== "boolean") {
    out.push(children);
  }
  return out;
}

/** JSX text can't hold braces or angle brackets bare; an expression can. */
function text(value: string): string {
  return /[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value;
}

export interface JsxSource {
  /** The JSX, two-space indented, one top-level node per line. */
  source: string;
  /** Every component tag used, as written (`Modal.Trigger`), in first-use order. */
  tags: string[];
}

/**
 * Serialize `node` to JSX. `root` names the component the node renders inside,
 * so shared parts resolve against it.
 *
 * Throws on anything JSX can't express as a literal, such as a function prop,
 * and on a component `nameOf` can't name: a snippet that silently dropped
 * either would paste and not run.
 */
export function toJsx(node: unknown, nameOf: NameOf, root?: string): JsxSource {
  const tags: string[] = [];

  const tagFor = (type: unknown, within: readonly string[]): string => {
    if (typeof type === "string") return type;
    const name = nameOf(type, within);
    if (!name) throw new Error("toJsx: a fixture uses a component that has no exported name");
    if (!tags.includes(name)) tags.push(name);
    return name;
  };

  const attribute = (prop: string, value: unknown, within: readonly string[]): string | null => {
    if (value === undefined || value === null) return null;
    if (value === true) return prop;
    if (typeof value === "string") {
      return value.includes('"') ? `${prop}={${JSON.stringify(value)}}` : `${prop}="${value}"`;
    }
    if (typeof value === "number" || typeof value === "boolean") return `${prop}={${value}}`;
    if (typeof value === "function") {
      throw new Error(`toJsx: prop "${prop}" is a function, which a pasted snippet can't carry`);
    }
    if (isElement(value)) return `${prop}={${element(value, "", within)}}`;
    return `${prop}={${jsLiteral(value)}}`;
  };

  const element = (el: ElementLike, indent: string, within: readonly string[]): string => {
    const tag = tagFor(el.type, within);
    const inside = [tag.split(".")[0], ...within];
    const { children, ...props } = el.props;
    const attrs = Object.entries(props)
      .map(([prop, value]) => attribute(prop, value, within))
      .filter((attr): attr is string => attr !== null);
    const open = attrs.length ? `<${tag} ${attrs.join(" ")}` : `<${tag}`;

    const kids = flatten(children);
    if (kids.length === 0) return `${indent}${open} />`;

    // Text-only children stay on the tag's line, as anyone would write them.
    if (kids.every((kid) => typeof kid === "string" || typeof kid === "number")) {
      return `${indent}${open}>${text(kids.join(""))}</${tag}>`;
    }
    const inner = kids
      .flatMap((kid, i) => {
        if (typeof kid !== "string") return [child(kid, `${indent}  `, inside)];
        // On its own line JSX trims a text child, so a space that separated it
        // from a neighbouring element has to be written out as {" "}.
        const lines: string[] = [];
        if (i > 0 && /^\s/.test(kid)) lines.push(`${indent}  {" "}`);
        if (kid.trim()) lines.push(child(kid.trim(), `${indent}  `, inside));
        if (i < kids.length - 1 && /\s$/.test(kid) && kid.trim()) lines.push(`${indent}  {" "}`);
        return lines;
      })
      .join("\n");
    return `${indent}${open}>\n${inner}\n${indent}</${tag}>`;
  };

  const child = (kid: unknown, indent: string, within: readonly string[]): string => {
    if (isElement(kid)) return element(kid, indent, within);
    if (typeof kid === "string" || typeof kid === "number") return `${indent}${text(String(kid))}`;
    throw new Error(`toJsx: can't write a ${typeof kid} child as JSX`);
  };

  const source = flatten(node)
    .map((kid) => child(kid, "", root ? [root.split(".")[0]] : []))
    .join("\n");
  return { source, tags };
}

/**
 * A `nameOf` over a module namespace such as `import * as UI from "astralis-ui"`.
 *
 * A standalone export (`Button`, `Textarea`) is always written by its own name.
 * A part is usually reachable twice, as `Tabs.List` and as the flat `TabsList`;
 * the dotted form wins, because it is how the docs write compounds, and among
 * dotted forms the enclosing compound's wins.
 */
export function namesFromModule(namespace: Record<string, unknown>): NameOf {
  const isComponent = (value: unknown) =>
    typeof value === "function" ||
    (typeof value === "object" && value !== null && "$$typeof" in value);

  const flat = new Map<unknown, string[]>();
  const dotted = new Map<unknown, string[]>();
  const add = (map: Map<unknown, string[]>, key: unknown, name: string) => {
    const names = map.get(key);
    if (names) names.push(name);
    else map.set(key, [name]);
  };

  for (const [name, value] of Object.entries(namespace)) {
    if (!/^[A-Z]/.test(name) || value === null) continue;
    if (typeof value !== "object" && typeof value !== "function") continue;
    if (isComponent(value)) add(flat, value, name);
    // A compound is either a component with parts attached (`Modal.Title`) or
    // a plain namespace object of parts (`CodeBlock.Root`).
    for (const [part, sub] of Object.entries(value)) {
      if (/^[A-Z]/.test(part) && isComponent(sub)) add(dotted, sub, `${name}.${part}`);
    }
  }

  return (type, within) => {
    const flatNames = flat.get(type) ?? [];
    const dottedNames = dotted.get(type) ?? [];
    const spelledOut = new Set(dottedNames.map((name) => name.replace(".", "")));
    const standalone = flatNames.find((name) => !spelledOut.has(name));
    if (standalone) return standalone;
    for (const root of within) {
      const local = dottedNames.find((name) => name.startsWith(`${root}.`));
      if (local) return local;
    }
    return (
      dottedNames.find((name) => flatNames.includes(name.replace(".", ""))) ??
      flatNames[0] ??
      dottedNames[0] ??
      null
    );
  };
}
