/* ==========================================================================
   Issue snapshots (format astralis-snapshot/1): the unit of evidence in the
   feedback loop. Built by the DevTools from a rendered page and by
   `astralis report` from source files; checked here before anything is sent,
   and again by the issue platform when it arrives.

   Pure JavaScript with no Node built-ins, so the same code runs in the
   browser overlay, the dev-server bridge, the CLI and the platform.
   ========================================================================== */

export const SNAPSHOT_FORMAT = "astralis-snapshot/1";

/** The largest snapshot the platform accepts, screenshot included. */
export const MAX_SNAPSHOT_BYTES = 256 * 1024;

export const LIMITS = {
  nodes: 300,
  depth: 30,
  findings: 100,
  console: 20,
  consoleMessage: 500,
  text: 200,
  title: 200,
  body: 4000,
};

/** Where drafts go unless a caller says otherwise (ASTRALIS_ISSUES_URL in Node). */
export const ISSUES_ORIGIN = "https://astralis-ui.com";
export const DRAFTS_PATH = "/api/issues/drafts";

/* ---- names and the spec -------------------------------------------------------- */

/**
 * The spec entry for a public name. "Card" and "CardBody" are keys already;
 * a part ("Card.Body") is found through its root's partExports. "X.Root" is
 * the root itself unless the root exports a separate Root (Calendar.Root is
 * CalendarRoot, not Calendar).
 */
export function specEntry(spec, name) {
  const components = spec?.components ?? {};
  const [root, part] = name.split(".");
  const found = (key) => (components[key] ? { key, entry: components[key] } : null);
  if (!part) return found(root);
  const exported = components[root]?.partExports?.[part];
  if (exported) return found(exported);
  if (part === "Root") return found(root);
  return found(`${root}${part}`);
}

/**
 * What a component does with its children: "text", "element", "block" or
 * "none". For a part, its root's partContent comes first: it describes the
 * part as it is used (Modal.Trigger takes one element), where the flat twin's
 * own entry describes the export on its own.
 */
export function contentOf(spec, name) {
  const [root, part] = name.split(".");
  const asPart = part ? spec?.components?.[root]?.partContent?.[part] : undefined;
  return asPart ?? specEntry(spec, name)?.entry?.content ?? null;
}

/** The spec's client tier for a name, or null when the spec has no entry for it. */
export function clientTier(spec, name) {
  return specEntry(spec, name)?.entry?.client ?? null;
}

/**
 * The props the spec describes for a name: its recipe and scalar props, the
 * style-prop groups it takes (with the interaction states when it takes the
 * box group) and the attributes it redefines, less those its type omits.
 * Null when the spec has no entry for the name.
 */
export function describedProps(spec, name) {
  const found = specEntry(spec, name);
  if (!found) return null;
  const { entry } = found;
  const names = new Set([...Object.keys(entry.props ?? {}), ...Object.keys(entry.scalarProps ?? {}), ...(entry.overrides ?? [])]);
  for (const group of entry.groups ?? []) {
    for (const prop of Object.keys(spec.propGroups?.[group] ?? {})) names.add(prop);
    if (group === "box") for (const state of Object.keys(spec.states ?? {})) names.add(state);
  }
  for (const prop of entry.exclude ?? []) names.delete(prop);
  return names;
}

/* ---- what may leave the machine ------------------------------------------------ */

/** Props that carry the application's content rather than how a component is configured. */
const CONTENT_PROPS = new Set([
  "alt", "ariaLabel", "code", "content", "defaultValue", "fallback", "href", "id", "items", "name",
  "options", "query", "sizes", "src", "srcSet", "srcset", "value",
]);
const CONTENT_SUFFIX = /(text|label|title|description|message|placeholder|caption|heading|tooltip)$/i;
const LONGEST_VALUE = 64;

/** Whether a prop may appear in a snapshot at all (the spec narrows it further). */
export function isConfigurationProp(key) {
  return !CONTENT_PROPS.has(key) && !CONTENT_SUFFIX.test(key) && !/^(on[A-Z]|data-|aria-)/.test(key);
}

function configurationValue(value, depth = 2) {
  if (typeof value === "string") return value.length <= LONGEST_VALUE ? value : undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (depth === 0 || typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const out = {};
  for (const [key, inner] of Object.entries(value)) {
    const kept = configurationValue(inner, depth - 1);
    if (kept !== undefined) out[key] = kept;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Keep only the props a snapshot may carry: described by the spec for this
 * name, configuration rather than content, and plain serialisable values.
 */
export function narrowProps(spec, name, props = {}) {
  const described = describedProps(spec, name);
  const out = {};
  if (!described) return out;
  for (const [key, value] of Object.entries(props)) {
    if (!described.has(key) || !isConfigurationProp(key)) continue;
    const kept = configurationValue(value);
    if (kept !== undefined) out[key] = kept;
  }
  return out;
}

/**
 * A tree with every component's props narrowed and its client tier read from
 * the spec. Whoever assembles a snapshot applies it, whatever built the tree,
 * so the rule on what may leave the machine has one home.
 */
export function narrowTree(spec, nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => {
    if (!node || typeof node !== "object" || !("component" in node)) return node;
    const out = {
      component: node.component,
      props: narrowProps(spec, node.component, node.props ?? {}),
      client: clientTier(spec, node.component),
    };
    if (Array.isArray(node.renders) && node.renders.length) out.renders = node.renders;
    out.children = narrowTree(spec, node.children ?? []);
    return out;
  });
}

/** A text placeholder: the reporter chose not to include page text. */
export const redactedText = (text) => ({ redacted: true, length: text.length });

/** Page text, trimmed to the snapshot's limit. */
export const keptText = (text) => ({ text: text.slice(0, LIMITS.text) });

/** A route without its query string or fragment. */
export const cleanRoute = (route) => (route ? route.split(/[?#]/)[0] || "/" : null);

/**
 * A console message fit to leave the machine: trimmed, with this page's origin
 * and any absolute file-system path reduced to what follows it.
 */
export function cleanConsoleMessage(message, origin = "") {
  let text = String(message);
  if (origin) text = text.split(origin).join("");
  text = text
    .replace(/file:\/\/\/?[^\s)'"]*?\/(node_modules|src|app|components|pages)\//g, "$1/")
    .replace(/[A-Za-z]:\\[^\s)'"]*?\\(node_modules|src|app|components|pages)\\/g, "$1/")
    .replace(/\/(?:Users|home)\/[^\s)'"/]+\/[^\s)'"]*?\/(node_modules|src|app|components|pages)\//g, "$1/");
  return text.slice(0, LIMITS.consoleMessage);
}

/* ---- the schema -------------------------------------------------------------- */

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v, max = 1000) => typeof v === "string" && v.length <= max;
const isOptional = (v, check) => v === null || v === undefined || check(v);
const TOP_LEVEL = new Set([
  "format", "source", "library", "environment", "route", "tree", "findings", "console", "screenshot", "description",
]);
const TIERS = new Set(["none", "leaf", "required"]);

function checkTree(nodes, errors) {
  let count = 0;
  const walk = (list, depth, at) => {
    if (!Array.isArray(list)) return errors.push(`${at} must be a list`);
    if (depth > LIMITS.depth) return errors.push(`${at} is nested more than ${LIMITS.depth} deep`);
    list.forEach((node, i) => {
      const here = `${at}[${i}]`;
      if (++count > LIMITS.nodes) return;
      if (!isObject(node)) return errors.push(`${here} must be an object`);
      if ("text" in node) {
        if (!isString(node.text, LIMITS.text) || Object.keys(node).length !== 1) errors.push(`${here} is not a text node`);
        return;
      }
      if ("redacted" in node) {
        if (node.redacted !== true || !Number.isInteger(node.length) || Object.keys(node).length !== 2) {
          errors.push(`${here} is not a redacted text node`);
        }
        return;
      }
      if (!isString(node.component, 100) || !/^[A-Z][A-Za-z0-9]*(\.[A-Z][A-Za-z0-9]*)?$/.test(node.component)) {
        return errors.push(`${here}.component must be a component name`);
      }
      if (!isObject(node.props)) errors.push(`${here}.props must be an object`);
      else if (JSON.stringify(node.props).length > 2000) errors.push(`${here}.props is too large`);
      if (!isOptional(node.client, (c) => TIERS.has(c))) errors.push(`${here}.client must be none, leaf or required`);
      if (node.renders !== undefined && !(Array.isArray(node.renders) && node.renders.every((r) => isString(r, 100)))) {
        errors.push(`${here}.renders must be a list of names`);
      }
      const known = new Set(["component", "props", "client", "renders", "children"]);
      for (const key of Object.keys(node)) if (!known.has(key)) errors.push(`${here} has an unknown field "${key}"`);
      walk(node.children ?? [], depth + 1, `${here}.children`);
    });
  };
  walk(nodes, 0, "tree");
  if (count > LIMITS.nodes) errors.push(`tree has more than ${LIMITS.nodes} nodes`);
}

const RELATIVE_PATH = /^(?![/\\])(?![A-Za-z]:)(?!.*(^|[/\\])\.\.([/\\]|$))[^\0]{1,300}$/;

/**
 * Check a snapshot against format astralis-snapshot/1. Returns the problems
 * found, or an empty list. Unknown fields are rejected, so nothing travels
 * that the reporter was not shown by name.
 */
export function checkSnapshot(value) {
  const errors = [];
  if (!isObject(value)) return ["a snapshot must be a JSON object"];
  for (const key of Object.keys(value)) if (!TOP_LEVEL.has(key)) errors.push(`unknown field "${key}"`);
  if (value.format !== SNAPSHOT_FORMAT) errors.push(`format must be "${SNAPSHOT_FORMAT}"`);
  if (value.source !== "devtools" && value.source !== "cli") errors.push('source must be "devtools" or "cli"');

  const lib = value.library;
  if (!isObject(lib) || lib.name !== "astralis-ui" || !isString(lib.version, 50) || !Number.isInteger(lib.specVersion) ||
      !/^[0-9a-f]{64}$/.test(lib.specSha256 ?? "")) {
    errors.push("library must give astralis-ui's version, specVersion and specSha256");
  }

  const env = value.environment;
  if (!isObject(env)) errors.push("environment must be an object");
  else {
    const fw = env.framework;
    if (!isObject(fw) || !isOptional(fw.name, (n) => n === "next" || n === "vite") || !isOptional(fw.version, (v) => isString(v, 50))) {
      errors.push("environment.framework must give a name (next or vite) and a version, or nulls");
    }
    if (!isOptional(env.react, (v) => isString(v, 50))) errors.push("environment.react must be a version or null");
    if (!isOptional(env.browser, (v) => isString(v, 60))) errors.push("environment.browser must be a short name or null");
    if (!isOptional(env.viewport, (v) => isObject(v) && Number.isInteger(v.width) && Number.isInteger(v.height))) {
      errors.push("environment.viewport must give an integer width and height, or null");
    }
    if (!isOptional(env.colorMode, (m) => m === "light" || m === "dark")) errors.push("environment.colorMode must be light, dark or null");
  }

  if (!isOptional(value.route, (r) => isString(r, 500) && r.startsWith("/") && !/[?#]/.test(r))) {
    errors.push("route must be a path without a query string, or null");
  }
  if (!Array.isArray(value.tree) || value.tree.length === 0) errors.push("tree must list at least one component");
  else if (!value.tree.every((node) => isObject(node) && "component" in node)) errors.push("tree must start at components, not text");
  else checkTree(value.tree, errors);

  if (value.findings !== undefined) {
    if (!Array.isArray(value.findings) || value.findings.length > LIMITS.findings) {
      errors.push(`findings must be a list of at most ${LIMITS.findings}`);
    } else {
      value.findings.forEach((f, i) => {
        const ok = isObject(f) && isString(f.code, 60) && isString(f.message, 500) && Number.isInteger(f.line) &&
          Number.isInteger(f.column) && typeof f.file === "string" && RELATIVE_PATH.test(f.file);
        if (!ok) errors.push(`findings[${i}] must have a code, a project-relative file, a line, a column and a message`);
      });
    }
  }
  if (value.console !== undefined) {
    const ok = Array.isArray(value.console) && value.console.length <= LIMITS.console &&
      value.console.every((m) => isString(m, LIMITS.consoleMessage));
    if (!ok) errors.push(`console must be a list of at most ${LIMITS.console} messages`);
  }
  if (value.screenshot !== undefined && !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value.screenshot ?? "")) {
    errors.push("screenshot must be a PNG or JPEG data URL");
  }

  const d = value.description;
  if (!isObject(d) || !isString(d.title, LIMITS.title) || !d.title.trim()) errors.push(`description.title is required (at most ${LIMITS.title} characters)`);
  else {
    for (const key of ["happened", "expected"]) {
      if (!isOptional(d[key], (t) => isString(t, LIMITS.body))) errors.push(`description.${key} must be at most ${LIMITS.body} characters`);
    }
    for (const key of Object.keys(d)) if (!["title", "happened", "expected"].includes(key)) errors.push(`description has an unknown field "${key}"`);
  }

  const bytes = new TextEncoder().encode(JSON.stringify(value)).length;
  if (bytes > MAX_SNAPSHOT_BYTES) errors.push(`the snapshot is ${Math.ceil(bytes / 1024)} kB; the limit is ${MAX_SNAPSHOT_BYTES / 1024} kB`);
  return errors;
}

/* ---- the reproduction file ------------------------------------------------------ */

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function jsLiteral(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value !== "object" || value === null) return String(value);
  const entries = Object.entries(value).map(([k, v]) => `${IDENT.test(k) ? k : JSON.stringify(k)}: ${jsLiteral(v)}`);
  return `{ ${entries.join(", ")} }`;
}

function jsxAttribute(key, value) {
  if (value === true) return key;
  if (typeof value === "string" && !/["{}\\\n]/.test(value)) return `${key}="${value}"`;
  return `${key}={${jsLiteral(value)}}`;
}

const escapeJsxText = (text) => text.replace(/[{}<>]/g, (c) => `{"${c}"}`);

function renderNodes(nodes, indent, lines) {
  for (const node of nodes) {
    if ("text" in node) {
      const text = node.text.trim();
      if (text) lines.push(`${indent}${escapeJsxText(text)}`);
      continue;
    }
    if ("redacted" in node) {
      lines.push(`${indent}Text`);
      continue;
    }
    const attrs = Object.entries(node.props ?? {}).map(([k, v]) => jsxAttribute(k, v));
    const open = [node.component, ...attrs].join(" ");
    const children = node.children ?? [];
    if (node.renders?.length) lines.push(`${indent}{/* renders through ${node.renders.join(", ")} */}`);
    if (children.length === 0) {
      lines.push(`${indent}<${open} />`);
      continue;
    }
    lines.push(`${indent}<${open}>`);
    renderNodes(children, `${indent}  `, lines);
    lines.push(`${indent}</${node.component}>`);
  }
}

function importedNames(nodes, into = new Set()) {
  for (const node of nodes) {
    if (!node.component) continue;
    into.add(node.component.split(".")[0]);
    importedNames(node.children ?? [], into);
  }
  return into;
}

/**
 * The snapshot's tree as a minimal file that renders it: repro.tsx. Page text
 * the reporter kept is used; redacted text becomes the word "Text". Run the
 * validator on it to see the snapshot's findings reproduce, or not.
 */
export function toRepro(snapshot) {
  const lib = snapshot.library ?? {};
  const names = [...importedNames(snapshot.tree ?? [])].sort();
  const lines = [];
  renderNodes(snapshot.tree ?? [], "      ", lines);
  const where = snapshot.route ? ` on ${snapshot.route}` : "";
  const how = snapshot.source === "cli" ? "astralis report" : "the Astralis DevTools";
  return [
    `// Reproduction of an Astralis issue snapshot${where}, captured with ${how}.`,
    `// astralis-ui ${lib.version ?? "unknown"} (spec ${lib.specVersion ?? "?"}).`,
    `import { ${names.join(", ")} } from "astralis-ui";`,
    "",
    "export default function Repro() {",
    "  return (",
    "    <>",
    ...lines,
    "    </>",
    "  );",
    "}",
    "",
  ].join("\n");
}

/* ---- sending ---------------------------------------------------------------------- */

/**
 * Post a checked snapshot to the issue platform as a draft. Resolves to the
 * draft's page URL; rejects with a message a person can act on.
 */
export async function submitDraft(snapshot, { origin = ISSUES_ORIGIN, fetchImpl = globalThis.fetch, timeoutMs = 15000 } = {}) {
  const problems = checkSnapshot(snapshot);
  if (problems.length) throw new Error(`The snapshot is not valid: ${problems.join("; ")}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetchImpl(new URL(DRAFTS_PATH, origin).toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(snapshot),
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(`Could not reach the Astralis issue platform at ${origin} (${error.name === "AbortError" ? "timed out" : error.message}).`);
  } finally {
    clearTimeout(timer);
  }
  let body = null;
  try {
    body = await response.json();
  } catch {
    // no JSON body
  }
  if (!response.ok) {
    const reason = body?.error ?? `${response.status} ${response.statusText}`.trim();
    throw new Error(`The issue platform did not accept the draft: ${reason}.`);
  }
  if (!body?.url) throw new Error("The issue platform accepted the draft but returned no address for it.");
  return new URL(body.url, origin).toString();
}
