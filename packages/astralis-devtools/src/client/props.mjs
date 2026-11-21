import { specEntry } from "astralis-cli/snapshot";

/* Every prop a component takes, read from the system spec: its own props
   first, then its style props by group. Pure, so it runs in the overlay and
   in Node tests alike. */

const GROUP_LABELS = {
  box: { label: "Box", hint: "spacing, size, paint, border, layout" },
  flex: { label: "Flex", hint: "direction, wrap, alignment, gap" },
  flexItem: { label: "Flex item", hint: "grow, shrink, basis, order" },
  grid: { label: "Grid", hint: "columns, rows, flow, gap" },
  gridItem: { label: "Grid item", hint: "spans and placement" },
  text: { label: "Text", hint: "size, weight, colour, alignment" },
  stack: { label: "Stack", hint: "direction, gap, alignment" },
  placement: { label: "Placement", hint: "size, margin, position, motion" },
};

/**
 * The spec lists some components' style props by name instead of by group
 * (List, Code, Separator; Stat, Select and others): when nearly all of a
 * group's names are there, they are shown as that group.
 */
const GROUP_COVERAGE = 0.9;

const docsOf = (entry, name) => {
  const docs = entry.propDocs?.[name];
  if (!docs || typeof docs !== "object") return {};
  return {
    ...(typeof docs.description === "string" && docs.description.trim() ? { description: docs.description.trim() } : {}),
    ...(typeof docs.default === "string" && docs.default.trim() ? { default: docs.default.trim() } : {}),
  };
};

/** The props of one group, long spellings folded into their short name ("padding" into "p"). */
function groupRows(definitions, names, taken) {
  const rows = new Map();
  for (const name of names) {
    const definition = definitions[name];
    if (!definition || taken.has(name)) continue;
    const short = definition.short && names.includes(definition.short) && !taken.has(definition.short) ? definition.short : null;
    if (short) {
      if (!rows.has(short)) rows.set(short, null);
      continue;
    }
    rows.set(name, {
      name,
      aliases: [],
      values: Array.isArray(definition.tokens) ? definition.tokens.map(String) : [],
      type: null,
      arbitrary: definition.arbitrary ? definition.valueType ?? "value" : null,
    });
  }
  for (const name of names) {
    const definition = definitions[name];
    if (definition?.short && rows.get(definition.short)) rows.get(definition.short).aliases.push(name);
  }
  for (const [name, row] of rows) {
    if (!row) rows.delete(name);
  }
  for (const row of rows.values()) for (const name of [row.name, ...row.aliases]) taken.add(name);
  return [...rows.values()];
}

/**
 * The props `name` takes, as sections of rows. `used` is the props this
 * instance was given; a row it uses carries `used: { as, value }`. Returns
 * null when the spec has no entry for the name.
 *
 *   { key, total, sections: [{ id, label, hint, inferred?, rows: [
 *       { name, aliases, values, type, arbitrary, required, note?, description?, default?, used } ] }] }
 */
export function propsModel(spec, name, used = {}) {
  const found = specEntry(spec, name);
  if (!found) return null;
  const { key, entry } = found;
  const groups = spec.propGroups ?? {};
  const closed = entry.props ?? {};
  const scalars = entry.scalarProps ?? {};
  const required = entry.required ?? {};
  const overrides = entry.overrides ?? [];
  const exclude = new Set(entry.exclude ?? []);
  const inGroups = new Set((entry.groups ?? []).flatMap((group) => Object.keys(groups[group] ?? {})));

  const ownNames = [...new Set([...Object.keys(closed), ...Object.keys(scalars), ...Object.keys(required), ...overrides])];
  let stray = (entry.ownStyleProps ?? []).filter((prop) => !ownNames.includes(prop) && !inGroups.has(prop) && !exclude.has(prop));

  const taken = new Set(ownNames);
  const sections = [];
  const groupSection = (group, names, inferred) => {
    const rows = groupRows(groups[group], names, taken);
    if (rows.length) sections.push({ id: `group:${group}`, label: GROUP_LABELS[group]?.label ?? group, hint: GROUP_LABELS[group]?.hint ?? "", ...(inferred ? { inferred: true } : {}), rows });
  };

  for (const group of entry.groups ?? []) {
    if (groups[group]) groupSection(group, Object.keys(groups[group]).filter((prop) => !exclude.has(prop)), false);
  }
  // Largest first: placement's names include all of flexItem's, and must claim them.
  const bySize = Object.entries(groups).sort(([, a], [, b]) => Object.keys(b).length - Object.keys(a).length);
  for (const [group, definitions] of bySize) {
    const names = Object.keys(definitions);
    const covered = names.filter((prop) => stray.includes(prop));
    if (names.length && covered.length / names.length >= GROUP_COVERAGE) {
      groupSection(group, covered, true);
      stray = stray.filter((prop) => !taken.has(prop));
    }
  }

  const own = [
    ...ownNames.map((prop) => ({
      name: prop,
      aliases: [],
      values: Array.isArray(closed[prop]) ? closed[prop].map(String) : [],
      type: scalars[prop] ?? required[prop] ?? null,
      arbitrary: null,
      ...(overrides.includes(prop) && !closed[prop] && !scalars[prop] && !required[prop] ? { note: "Its own attribute, not the style prop" } : {}),
    })),
    ...stray.map((prop) => ({ name: prop, aliases: [], values: [], type: null, arbitrary: null, note: "Values not in the spec" })),
  ];
  if (own.length) sections.unshift({ id: "own", label: "Its own props", hint: "", rows: own });

  for (const section of sections) {
    for (const row of section.rows) {
      row.required = Object.hasOwn(required, row.name);
      Object.assign(row, docsOf(entry, row.name));
      const as = [row.name, ...row.aliases].find((prop) => used && Object.hasOwn(used, prop));
      row.used = as ? { as, value: used[as] } : null;
    }
    // Required props lead their section; the spec's order is kept otherwise.
    section.rows.sort((a, b) => Number(b.required) - Number(a.required));
  }

  return { key, total: sections.reduce((n, section) => n + section.rows.length, 0), sections };
}

/**
 * The rows matching `query` by prop name (or long spelling) or by a value it
 * takes. A row found by a value is marked `byValue`, so its whole list can be
 * shown. An empty query keeps everything.
 */
export function filterProps(model, query) {
  const q = query.trim().toLowerCase();
  if (!model) return { sections: [], count: 0 };
  if (!q) return { sections: model.sections, count: model.total };
  const sections = [];
  for (const section of model.sections) {
    const rows = [];
    for (const row of section.rows) {
      if ([row.name, ...row.aliases].some((name) => name.toLowerCase().includes(q))) rows.push(row);
      else if (row.values.some((value) => value.toLowerCase().includes(q)) || row.type?.toLowerCase() === q) rows.push({ ...row, byValue: true });
    }
    if (rows.length) sections.push({ ...section, rows });
  }
  return { sections, count: sections.reduce((n, section) => n + section.rows.length, 0) };
}
