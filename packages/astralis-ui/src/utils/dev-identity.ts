import { createElement, type ElementType } from "react";
import { BREAKPOINTS } from "../const/breakpoints";
import { CONTAINER_BREAKPOINT_WIDTHS } from "../const/channel";
import { isStateProp } from "./state-props";
import { COMPONENT_STYLE_PROPS, HTML_ATTRIBUTE_NAMES, LOOK_HINTS, STYLE_PROP_GROUPS } from "./dev-style-props";

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

// Built on first use, so a production bundle keeps no top-level reference to
// the breakpoint tables.
let responsiveKeys: Set<string> | undefined;
const isResponsiveKey = (key: string) =>
  (responsiveKeys ??= new Set(["base", ...BREAKPOINTS, ...Object.keys(CONTAINER_BREAKPOINT_WIDTHS)])).has(key);

/**
 * The only objects an Astralis prop takes: a responsive map ({ base, md }) or
 * a state payload (hover={{ bg }}), each holding plain values. Any other object
 * belongs to something else the component renders through (framer-motion's
 * `transition`, `initial`, `animate`), and can differ between the server and
 * the first client render, which would make React report a hydration mismatch.
 */
function describeValue(key: string, value: unknown): Leaf | Described | undefined {
  if (isLeaf(value)) return value;
  if (typeof value !== "object" || value === null) return undefined;
  if (Object.getPrototypeOf(value) !== Object.prototype || "$$typeof" in value) return undefined;
  if (!isStateProp(key) && !Object.keys(value).every(isResponsiveKey)) return undefined;
  const out: Described = {};
  for (const [inner, leaf] of Object.entries(value)) {
    if (isLeaf(leaf)) out[inner] = leaf;
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
    const described = describeValue(key, value);
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

/*
 * A style prop a component does not take reaches the HTML as a stray
 * attribute and changes nothing; `astralis validate` reports it as
 * unknown-style-prop. Development builds say the same in the console, once per
 * component and prop, judged from the same spec (dev-style-props.ts is
 * generated from it), in the validator's words. The attribute still renders:
 * nothing is stripped. The wrapper sees the props as the caller wrote them,
 * before the component takes its own.
 */

/* Mirrors DOCTRINE_PAINT_PROPS in astralis-cli's validate-core.mjs. */
const PAINT_PROPS = new Set(["p", "px", "py", "pt", "pr", "pb", "pl", "bg", "borderColor", "shadow"]);
let styleNames: Set<string> | undefined;
const takenBy = new Map<string, { groups: string[]; takes: Set<string> }>();
const warned = new Set<string>();

function styleTable(name: string) {
  const row = COMPONENT_STYLE_PROPS[name];
  if (!row) return undefined;
  let table = takenBy.get(name);
  if (!table) {
    const groups = row[0] ? row[0].split(" ") : [];
    const own = row[1] ? row[1].split(" ") : [];
    table = { groups, takes: new Set([...groups.flatMap((group) => STYLE_PROP_GROUPS[group] ?? []), ...own]) };
    takenBy.set(name, table);
  }
  return table;
}

/** The style props `name` was given but does not take, as the validator judges them. */
export function ignoredStyleProps(name: string, props: Record<string, unknown>): string[] {
  const table = styleTable(name);
  if (!table) return [];
  styleNames ??= new Set(Object.values(STYLE_PROP_GROUPS).flat());
  return Object.keys(props).filter(
    (prop) =>
      props[prop] !== undefined &&
      styleNames!.has(prop) &&
      !table.takes.has(prop) &&
      !HTML_ATTRIBUTE_NAMES.includes(prop),
  );
}

/**
 * Warn about the style props `name` ignores. In a chain (Modal.Trigger
 * rendering a Button) a prop an outer component was given is that
 * component's to report: the warning names it, and says nothing when the
 * outer component has a table of its own, because it has already judged.
 */
export function warnIgnoredStyleProps(name: string, props: Record<string, unknown>): void {
  const ignored = ignoredStyleProps(name, props);
  if (ignored.length === 0) return;
  const outer = typeof props[IDENTITY_ATTRIBUTE] === "string" ? (props[IDENTITY_ATTRIBUTE] as string).split(" ") : [];
  const outerGiven = outerProps(props, outer.length);
  const { groups } = styleTable(name)!;
  for (const prop of ignored) {
    const by = outer.findIndex((_, index) => prop in outerGiven[index]);
    if (by !== -1 && COMPONENT_STYLE_PROPS[outer[by]]) continue;
    const subject = by === -1 ? name : outer[by];
    const key = `${subject} ${prop}`;
    if (warned.has(key)) continue;
    warned.add(key);
    const look = groups.length === 1 && groups[0] === "placement" && PAINT_PROPS.has(prop) ? LOOK_HINTS[subject] ?? LOOK_HINTS[name] : undefined;
    const hint = !look
      ? `${subject} takes ${groups.length ? `${groups.join(", ")} props` : "no style props"}; put ${prop} on a Box around it`
      : look[0]
        ? `${subject} is part of ${look[0]} and has no look of its own: ${look[1] ? `set ${look[1]} on the ${look[0]}, or ` : ""}put ${prop} on a Box inside it`
        : look[1]
          ? `${subject} owns how it looks; reach for ${look[1]}`
          : `${subject} owns how it looks; put ${prop} on a Box around it`;
    console.warn(
      `[astralis-ui] ${subject} does not take ${prop}: it reaches the HTML as a stray attribute and changes nothing (${hint})`,
    );
  }
}

/**
 * Give a component its public name. In development the returned component
 * renders the original with the identity attributes added, and reports the
 * style props it ignores; in production it is the original. Either way it
 * carries `displayName`.
 */
export function identify<C extends object>(name: string, component: C): C & { displayName: string } {
  // The development half sits inside the branch, so a production bundle drops
  // it and the table it reads.
  if (process.env.NODE_ENV !== "production") {
    const Identified = (props: Record<string, unknown>) => {
      warnIgnoredStyleProps(name, props);
      return createElement(component as ElementType, withIdentity(name, props));
    };
    Identified.displayName = name;
    return Identified as unknown as C & { displayName: string };
  }
  return Object.assign(component, { displayName: name });
}
