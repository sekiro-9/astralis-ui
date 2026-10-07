import { IDENTITY_ATTRIBUTE, readIdentity } from "./identity.mjs";

/* What is on the page, and which of the validator's findings belong to it.
   Pure apart from reading the DOM it is given, so it runs in Node tests. */

/**
 * Every astralis-ui component rendered on the page, in document order, each
 * with its chain (outermost first). The overlay's own element is skipped.
 */
export function scanPage(root, skip = null) {
  const instances = [];
  for (const element of root.querySelectorAll(`[${IDENTITY_ATTRIBUTE}]`)) {
    if (skip && (element === skip || skip.contains(element))) continue;
    const chain = readIdentity(element);
    if (chain.length) instances.push({ element, chain, name: chain[0].name });
  }
  return instances;
}

/** The instances grouped by the component they are, most used first, then by name. */
export function groupByComponent(instances) {
  const groups = new Map();
  for (const instance of instances) {
    if (!groups.has(instance.name)) groups.set(instance.name, []);
    groups.get(instance.name).push(instance);
  }
  return [...groups]
    .map(([name, list]) => ({ name, instances: list }))
    .sort((a, b) => b.instances.length - a.instances.length || a.name.localeCompare(b.name));
}

/**
 * The findings, flattened, each with its file and severity. `files` limits
 * them to the files that render the page, when those are known.
 */
export function flatFindings(findings, files = null) {
  const out = [];
  for (const result of findings?.results ?? []) {
    if (files && !files.includes(result.file)) continue;
    for (const finding of result.errors) out.push({ ...finding, file: result.file, kind: "error" });
    for (const finding of result.warnings) out.push({ ...finding, file: result.file, kind: "warning" });
  }
  return out;
}

/**
 * The findings about this instance's component, from anywhere in the project.
 * `exact`: certainly about this very instance, because the finding names an
 * attribute and value this instance was given, or it is in a file that renders
 * the page and this is the only one of its component there. `onPage`: in a
 * file that renders the page. Exact ones first, then the page's, errors first.
 */
export function findingsFor(instance, findings, { routeFiles = [], alone = false } = {}) {
  const names = new Set(instance.chain.map((c) => c.name));
  return flatFindings(findings)
    .filter((finding) => finding.component && names.has(finding.component))
    .map((finding) => {
      const props = instance.chain.find((c) => c.name === finding.component)?.props ?? {};
      const onPage = routeFiles.includes(finding.file);
      const given = finding.prop !== undefined && finding.value !== undefined && finding.prop in props && String(props[finding.prop]) === String(finding.value);
      return { ...finding, onPage, exact: given || (alone && onPage) };
    })
    .sort(
      (a, b) =>
        Number(b.exact) - Number(a.exact) ||
        Number(b.onPage) - Number(a.onPage) ||
        (a.kind === b.kind ? 0 : a.kind === "error" ? -1 : 1),
    );
}

/** The findings that are likely on a group's instances: exact for one of them, or in the page's files. */
export function findingsForGroup(group, findings, routeFiles = []) {
  const seen = new Map();
  for (const instance of group.instances) {
    for (const finding of findingsFor(instance, findings, { routeFiles, alone: group.instances.length === 1 })) {
      if (!finding.exact && !finding.onPage) continue;
      seen.set(`${finding.file}:${finding.line}:${finding.column}:${finding.code}`, finding);
    }
  }
  const list = [...seen.values()];
  return { errors: list.filter((f) => f.kind === "error").length, warnings: list.filter((f) => f.kind === "warning").length };
}

/** A short, local description of one instance for a list: its text, else its first props. */
export function instanceLabel(instance) {
  const text = (instance.element.textContent ?? "").replace(/\s+/g, " ").trim();
  const props = Object.entries(instance.chain[0].props)
    .slice(0, 2)
    .map(([key, value]) => `${key}=${typeof value === "string" ? `"${value}"` : JSON.stringify(value)}`)
    .join(" ");
  return { text: text.length > 42 ? `${text.slice(0, 40)}…` : text, props };
}
