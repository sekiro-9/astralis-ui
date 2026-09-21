import { createElement, type ElementType } from "react";

/**
 * Development builds name every component on the element it renders, so a
 * tool looking at the page (the Astralis DevTools) can tell a Card.Body from
 * any other <div>. That includes Server Components, which never hydrate and
 * so are invisible to React DevTools; the attributes are rendered on the
 * server with the rest of the HTML.
 *
 *   data-astralis        "Card.Body", or a chain such as "Modal.Trigger Button"
 *                        when one component renders through another onto the
 *                        same element (outermost first)
 *   data-astralis-props  a JSON array with one object per name in the chain:
 *                        the props that component was given, as described below
 *
 * The attributes travel as ordinary data-* props, which every component with
 * a root element passes to it (src/dom-identity.test.tsx). In production
 * `identify` hands back the component untouched, so the bundler drops the rest
 * and the HTML is what it was before this existed.
 */

export const IDENTITY_ATTRIBUTE = "data-astralis";
export const PROPS_ATTRIBUTE = "data-astralis-props";

/** Props that carry the consumer's content rather than how a component is configured. */
const CONTENT_PROPS = new Set([
  "alt",
  "code",
  "content",
  "defaultValue",
  "fallback",
  "href",
  "id",
  "items",
  "name",
  "options",
  "query",
  "src",
  "srcSet",
  "value",
]);
/** `label`, `title`, and any name ending in one of these (`loadingText`, `emptyLabel`). */
const CONTENT_SUFFIX = /(text|label|title|description|message|placeholder|caption|heading|tooltip)$/i;
const NOT_CONFIGURATION = /^(children|ref|key|className|style|on[A-Z].*|(data|aria)-.*)$/;
const LONGEST_VALUE = 64;

type Leaf = string | number | boolean;
type Described = { [key: string]: Leaf | Described };

function isLeaf(value: unknown): value is Leaf {
  if (typeof value === "string") return value.length <= LONGEST_VALUE;
  return typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value));
}

/** A responsive map or a state object ({ base, md } or { _hover: { bg } }), two levels at most. */
function describeValue(value: unknown, depth: number): Leaf | Described | undefined {
  if (isLeaf(value)) return value;
  if (depth === 0 || typeof value !== "object" || value === null) return undefined;
  if (Object.getPrototypeOf(value) !== Object.prototype || "$$typeof" in value) return undefined;
  const out: Described = {};
  for (const [key, inner] of Object.entries(value)) {
    const described = describeValue(inner, depth - 1);
    if (described !== undefined) out[key] = described;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * The props that say how a component was configured: variant, size, style
 * props and the like. Never children, text, links, sources, handlers or any
 * other content; a string longer than a token is dropped as probable content.
 */
export function describeProps(props: Record<string, unknown>): Described {
  const out: Described = {};
  for (const [key, value] of Object.entries(props)) {
    if (NOT_CONFIGURATION.test(key) || CONTENT_PROPS.has(key) || CONTENT_SUFFIX.test(key)) continue;
    const described = describeValue(value, 2);
    if (described !== undefined) out[key] = described;
  }
  return out;
}

function outerProps(props: Record<string, unknown>, count: number): Described[] {
  try {
    const parsed: unknown = JSON.parse(String(props[PROPS_ATTRIBUTE]));
    if (Array.isArray(parsed) && parsed.length === count) return parsed as Described[];
  } catch {
    // Not ours, or not JSON: keep the names and start their props afresh.
  }
  return Array.from({ length: count }, () => ({}));
}

/** The props with this component's name and configuration added to the chain. */
export function withIdentity(name: string, props: Record<string, unknown>): Record<string, unknown> {
  const outer = typeof props[IDENTITY_ATTRIBUTE] === "string" ? (props[IDENTITY_ATTRIBUTE] as string) : "";
  const names = outer ? outer.split(" ") : [];
  const own = describeProps(props);
  return {
    ...props,
    [IDENTITY_ATTRIBUTE]: [...names, name].join(" "),
    [PROPS_ATTRIBUTE]: JSON.stringify([...outerProps(props, names.length), own]),
  };
}

/**
 * Give a component its public name. In development the returned component
 * renders the original with the identity attributes added; in production it
 * is the original. Either way it carries `displayName`.
 */
export function identify<C extends object>(name: string, component: C): C & { displayName: string } {
  if (process.env.NODE_ENV === "production") {
    return Object.assign(component, { displayName: name });
  }
  const Identified = (props: Record<string, unknown>) =>
    createElement(component as ElementType, withIdentity(name, props));
  Identified.displayName = name;
  return Identified as unknown as C & { displayName: string };
}
