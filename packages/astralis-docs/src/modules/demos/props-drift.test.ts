import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import spec from "astralis-ui/system-spec.json";
import type { PropRow } from "@/modules/docs/props-table";

/**
 * Every documented prop, checked against the library's own machine-readable
 * spec (`dist/system-spec.json`, the artifact `astralis validate` and the MCP
 * server read). A props table is hand-written, so this is what stops it from
 * promising a prop or a value the component doesn't have.
 *
 * What it can prove depends on what the spec lists. Today each entry carries
 * its closed string-literal props, its required props, its style-prop groups
 * and its parts, but not booleans, numbers, open strings or node props. So:
 *
 * - FAILS on a documented literal value the spec doesn't allow, on a part the
 *   component doesn't have, and on a props file with no component to check.
 * - FAILS on a documented prop the spec doesn't list, but only once the spec
 *   lists every kind of prop (see `listsEveryProp`). Until then those names
 *   are reported as unverified rather than guessed at.
 * - REPORTS spec props that no table documents. That list is advisory: a
 *   deprecated alias or a DOM enum can be there on purpose.
 */

interface SpecEntry {
  groups?: string[];
  props?: Record<string, unknown>;
  required?: Record<string, string>;
  parts?: string[];
  partOf?: string;
}

const components = spec.components as unknown as Record<string, SpecEntry>;
const propGroups = spec.propGroups as unknown as Record<string, Record<string, unknown>>;

/**
 * Props every component takes by way of React or the DOM element it renders.
 * The spec describes the design system, not HTML, so these are never in it.
 */
const INHERITED = new Set([
  "as",
  "checked",
  "children",
  "className",
  "defaultChecked",
  "defaultValue",
  "disabled",
  "href",
  "id",
  "maxLength",
  "name",
  "onChange",
  "onClick",
  "placeholder",
  "readOnly",
  "ref",
  "required",
  "rows",
  "style",
  "type",
  "value",
]);

/**
 * Props files whose rows don't describe one component's props.
 * Keep this short: every entry is a table nothing checks.
 */
const NOT_A_COMPONENT: Record<string, string> = {
  placementProps: "documents the shared placement group, checked below against propGroups",
  toastOptionsProps: "documents the toast() options object, not a component",
};

/**
 * `fooBarProps` → `FooBar`; `fooPartsProps` documents the parts of `Foo`.
 * A part with no spec entry of its own (`menuItemProps` → `Menu.Item`) is
 * checked against its root, which lists it as a part.
 */
function componentFor(exportName: string): { component: string; parts: boolean } {
  const parts = exportName.endsWith("PartsProps");
  const stem = exportName.replace(parts ? /PartsProps$/ : /Props$/, "");
  const component = stem[0].toUpperCase() + stem.slice(1);
  if (parts || components[component]) return { component, parts };
  for (const [root, entry] of Object.entries(components)) {
    const part = component.slice(root.length);
    if (component.startsWith(root) && entry.parts?.includes(part)) return { component: root, parts: true };
  }
  return { component, parts };
}

/**
 * The prop names one row documents. Tables group related props for the reader
 * (`value / defaultValue / onChange`, `p · px · py · pt/pb/pl/pr`,
 * `overflow(X/Y)`, `Modal.Header / Body / Footer`); this expands them back.
 */
function documentedNames(label: string): string[] {
  const expanded = label
    // `overflow(X/Y)` → `overflow / overflowX / overflowY`
    .replace(/([a-z][A-Za-z]*)\(([A-Z][a-z]?(?:\/[A-Z][a-z]?)*)\)/g, (_, stem: string, suffixes: string) =>
      [stem, ...suffixes.split("/").map((suffix) => stem + suffix)].join(" / "),
    )
    // `rounded (+ roundedT/R/B/L)` → the parenthesis is just more names
    .replace(/\(\+\s*/g, " / ")
    .replace(/[()…]/g, " ");

  const names: string[] = [];
  let previous = "";
  for (const raw of expanded.split(/\s*[·,/]\s*/)) {
    const token = raw.trim();
    if (!token) continue;
    let name = token;
    // `borderT/R/B/L`, `roundedTl/Tr`: a bare suffix borrows the previous stem.
    if (/^[A-Z][a-z]?$/.test(token) && /[a-z][A-Z][a-z]?$/.test(previous)) {
      name = previous.replace(/[A-Z][a-z]?$/, "") + token;
    }
    // `Modal.Header / Body`: a bare part borrows the previous root.
    else if (/^[A-Z][a-zA-Z]+$/.test(token) && previous.includes(".")) {
      name = `${previous.split(".")[0]}.${token}`;
    }
    names.push(name);
    previous = name;
  }
  return names;
}

/** `"sm" | "md"` → ["sm", "md"]; null unless the type is purely quoted literals. */
function literals(type: string): string[] | null {
  const members = type.split("|").map((part) => part.trim());
  if (members.length < 2) return null;
  const values = members.map((member) => member.match(/^"([^"]*)"$/)?.[1]);
  return values.every((value) => value !== undefined) ? (values as string[]) : null;
}

/**
 * True once the spec lists props beyond closed literal unions. A spec that
 * describes a boolean or an open string would carry a non-array descriptor or
 * a `true`/`false` pair; until one does, a missing name proves nothing.
 */
const listsEveryProp = Object.values(components).some((entry) =>
  Object.values(entry.props ?? {}).some(
    (value) =>
      !Array.isArray(value) ||
      (value.length === 2 && value.includes("true") && value.includes("false")),
  ),
);

function knownProps(name: string): Set<string> {
  const entry = components[name];
  const known = new Set<string>([
    ...Object.keys(entry.props ?? {}),
    ...Object.keys(entry.required ?? {}),
  ]);
  for (const group of entry.groups ?? []) {
    for (const prop of Object.keys(propGroups[group] ?? {})) known.add(prop);
  }
  return known;
}

function hasPart(root: string, part: string): boolean {
  return (components[root]?.parts ?? []).includes(part) || components[`${root}${part}`]?.partOf === root;
}

/* Every `*-props.ts` module under demos/, loaded as the props tables load it. */
const demosDir = fileURLToPath(new URL(".", import.meta.url));
const files = readdirSync(demosDir, { recursive: true, encoding: "utf8" }).filter((file) =>
  /-props\.ts$/.test(file),
);
const tables: { file: string; exportName: string; rows: PropRow[] }[] = [];
for (const file of files) {
  const exports = (await import(pathToFileURL(join(demosDir, file)).href)) as Record<string, unknown>;
  for (const [exportName, rows] of Object.entries(exports)) {
    if (Array.isArray(rows)) tables.push({ file, exportName, rows: rows as PropRow[] });
  }
}

describe("documentedNames", () => {
  it.each([
    ["variant", ["variant"]],
    ["value / defaultValue / onChange", ["value", "defaultValue", "onChange"]],
    ["p · px · py · pt/pb/pl/pr", ["p", "px", "py", "pt", "pb", "pl", "pr"]],
    ["opacity · overflow(X/Y)", ["opacity", "overflow", "overflowX", "overflowY"]],
    ["border (+ borderT/R/B/L)", ["border", "borderT", "borderR", "borderB", "borderL"]],
    ["rounded (+ roundedT/R, roundedTl/Tr)", ["rounded", "roundedT", "roundedR", "roundedTl", "roundedTr"]],
    ["Modal.Header / Body / Footer", ["Modal.Header", "Modal.Body", "Modal.Footer"]],
    ["alignItems · justifyContent · wrap …", ["alignItems", "justifyContent", "wrap"]],
  ])("reads %s", (label, names) => {
    expect(documentedNames(label)).toEqual(names);
  });
});

const unverified: string[] = [];
const documented = new Map<string, Set<string>>();

describe("documented props match system-spec.json", () => {
  it("finds the props tables", () => {
    expect(tables.length).toBeGreaterThan(40);
  });

  it.each(tables.map((t) => [t.exportName, t] as const))("%s", (_name, { exportName, rows }) => {
    if (exportName === "placementProps") {
      const placement = propGroups.placement;
      for (const row of rows) {
        for (const prop of documentedNames(row.prop)) expect(Object.keys(placement)).toContain(prop);
      }
      return;
    }
    if (NOT_A_COMPONENT[exportName]) return;

    const { component, parts } = componentFor(exportName);
    expect(components, `${exportName} has no ${component} in the spec`).toHaveProperty([component]);
    const known = knownProps(component);
    const seen = documented.get(component) ?? new Set<string>();
    documented.set(component, seen);

    for (const row of rows) {
      for (const name of documentedNames(row.prop)) {
        if (name.includes(".")) {
          const [root, part] = name.split(".");
          expect(hasPart(root, part), `${exportName}: ${name} is not a part of ${root}`).toBe(true);
          continue;
        }
        expect(name, `${exportName}: "${row.prop}" isn't a prop name`).toMatch(/^[a-z][A-Za-z0-9]*$/);
        // A part's own props aren't in the spec at all; its root's are a
        // different vocabulary, so comparing against them would prove nothing.
        if (parts) {
          unverified.push(`${exportName}.${name}`);
          continue;
        }
        seen.add(name);

        const values = literals(row.type);
        const specValues = (components[component].props ?? {})[name];
        if (values && Array.isArray(specValues)) {
          for (const value of values) {
            expect(specValues, `${component}.${name} documents "${value}"`).toContain(value);
          }
        }

        if (known.has(name) || INHERITED.has(name)) continue;
        if (listsEveryProp) {
          expect.fail(`${component} has no prop "${name}" (documented in ${exportName})`);
        }
        unverified.push(`${component}.${name}`);
      }
    }
  });

  it("reports what the spec lists and no table documents", () => {
    const undocumented: string[] = [];
    for (const [component, seen] of documented) {
      const own = [
        ...Object.keys(components[component].props ?? {}),
        ...Object.keys(components[component].required ?? {}),
      ];
      for (const prop of own) if (!seen.has(prop)) undocumented.push(`${component}.${prop}`);
    }
    if (undocumented.length) {
      console.info(`Spec props no table documents (${undocumented.length}):\n  ${undocumented.join("\n  ")}`);
    }
    if (unverified.length && !listsEveryProp) {
      console.info(
        `Documented props the spec can't confirm yet, because it lists only literal-union props (${unverified.length}):\n  ${unverified.join(", ")}`,
      );
    }
  });
});
