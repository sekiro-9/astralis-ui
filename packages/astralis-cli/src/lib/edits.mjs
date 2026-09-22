import { parse } from "@babel/parser";

/**
 * Idempotent transforms for init's and theme's entry-file edits. Every function
 * returns { source, changed, note? } and NEVER guesses: when a file's shape is
 * ambiguous or unparseable it declines with a note, so the caller can print
 * manual instructions instead of corrupting code.
 */

const PARSE_OPTIONS = { sourceType: "module", plugins: ["typescript", "jsx"] };

function parseModule(source) {
  try {
    return parse(source, PARSE_OPTIONS);
  } catch {
    return null;
  }
}

/** True when the source is a module Babel can parse — the check before any write. */
export function parses(source) {
  return parseModule(source) !== null;
}

const importedName = (specifier) =>
  specifier.imported.type === "Identifier" ? specifier.imported.name : specifier.imported.value;

/** Named imports that provide a runtime value (`import type` provides none). */
function valueNames(declaration) {
  if (declaration.importKind === "type") return [];
  return declaration.specifiers
    .filter((s) => s.type === "ImportSpecifier" && s.importKind !== "type")
    .map(importedName);
}

/**
 * Where a new top-level line goes: after the last import, else after the
 * directive prologue ("use client"), else at the very top. Positioned at the
 * end of that statement's line, unless a comment opened on that line runs past
 * it — then right after the statement.
 */
function insertionPoint(ast, source) {
  const imports = ast.program.body.filter((n) => n.type === "ImportDeclaration");
  const anchor = imports.at(-1) ?? ast.program.directives.at(-1) ?? ast.program.interpreter;
  if (!anchor) return { at: 0, top: true };

  const newline = source.indexOf("\n", anchor.end);
  const lineEnd = newline === -1 ? source.length : newline;
  const spanning = ast.comments.some((c) => c.start >= anchor.end && c.start < lineEnd && c.end > lineEnd);
  return { at: spanning ? anchor.end : lineEnd, top: false };
}

/** The file's own quote and semicolon habit, read off its last import. */
function importStyle(ast) {
  const last = ast.program.body.filter((n) => n.type === "ImportDeclaration").at(-1);
  if (!last) return null;
  return { quote: last.source.extra.raw[0], semicolon: last.source.end < last.end };
}

/** Re-render a single-line import in the file's style. */
function restyle(line, declaration, style) {
  if (!style) return line;
  const { start, end } = declaration.source;
  const quoted = style.quote + declaration.source.value + style.quote;
  const body = line.slice(0, start) + quoted + line.slice(end, declaration.end).replace(/;\s*$/, "");
  return body + (style.semicolon ? ";" : "");
}

/**
 * Add imports that aren't already satisfied, judged by parsed specifiers, not
 * text: `import { AstralisProvider, Button } from 'astralis-ui'` already
 * provides AstralisProvider, however it is quoted or wrapped. A named import
 * missing from an existing declaration of the same module is merged into it,
 * so the file never gains a second import of the same binding.
 *
 * `lines` are single import statements, e.g. `import "astralis-ui/styles.css";`.
 * A default or namespace import is added whole unless one already exists.
 */
export function addImports(source, lines) {
  const ast = parseModule(source);
  if (!ast) return { source, changed: false, note: "the file doesn't parse, so it was left alone" };

  const existing = ast.program.body.filter((n) => n.type === "ImportDeclaration");
  const style = importStyle(ast);
  const merges = []; // { at, text }
  const additions = [];

  for (const line of lines) {
    const wanted = parse(line, PARSE_OPTIONS).program.body[0];
    const from = wanted.source.value;
    const sameModule = existing.filter((n) => n.source.value === from);

    if (wanted.specifiers.length === 0) {
      // Any import of a module evaluates it, so a side-effect import is satisfied by any of them.
      if (sameModule.length === 0) additions.push(restyle(line, wanted, style));
      continue;
    }

    if (wanted.specifiers.some((s) => s.type !== "ImportSpecifier")) {
      const kinds = wanted.specifiers.map((s) => s.type);
      const satisfied = sameModule.some(
        (n) => n.importKind !== "type" && kinds.every((kind) => n.specifiers.some((s) => s.type === kind)),
      );
      if (!satisfied) additions.push(restyle(line, wanted, style));
      continue;
    }

    const have = new Set(sameModule.flatMap(valueNames));
    const missing = valueNames(wanted).filter((name) => !have.has(name));
    if (missing.length === 0) continue;

    const target = sameModule.find(
      (n) => n.importKind !== "type" && n.specifiers.some((s) => s.type === "ImportSpecifier"),
    );
    if (target) {
      const lastSpecifier = target.specifiers.filter((s) => s.type === "ImportSpecifier").at(-1);
      merges.push({ at: lastSpecifier.end, text: missing.map((name) => `, ${name}`).join("") });
    } else {
      const named = `import { ${missing.join(", ")} } from "${from}";`;
      additions.push(restyle(named, parse(named, PARSE_OPTIONS).program.body[0], style));
    }
  }

  if (merges.length === 0 && additions.length === 0) return { source, changed: false };

  // Splice from the end backwards so earlier offsets stay valid.
  const { at, top } = insertionPoint(ast, source);
  const edits = [...merges];
  if (additions.length > 0) {
    edits.push({ at, text: top ? additions.join("\n") + "\n" : "\n" + additions.join("\n") });
  }
  let next = source;
  for (const edit of edits.sort((a, b) => b.at - a.at)) {
    next = next.slice(0, edit.at) + edit.text + next.slice(edit.at);
  }
  return { source: next, changed: true };
}

/** Insert a top-level statement after the import block (e.g. the theme-init const). */
export function addStatementAfterImports(source, statement) {
  if (source.includes(statement.slice(0, 40))) return { source, changed: false };
  const ast = parseModule(source);
  if (!ast) return { source, changed: false, note: "the file doesn't parse, so it was left alone" };
  const { at, top } = insertionPoint(ast, source);
  const text = top ? statement + "\n\n" : "\n\n" + statement;
  return { source: source.slice(0, at) + text + source.slice(at), changed: true };
}

/** Wrap a single unambiguous occurrence of `target` in open/close JSX tags. */
export function wrapJsx(source, target, open, close) {
  const count = source.split(target).length - 1;
  if (count === 0) return { source, changed: false, note: `no ${target} found to wrap` };
  if (count > 1) return { source, changed: false, note: `${target} appears ${count} times — wrap it manually` };
  return { source: source.replace(target, `${open}${target}${close}`), changed: true };
}

/** Add an attribute to a single unambiguous tag (e.g. suppressHydrationWarning on <html>). */
export function addTagAttribute(source, tag, attribute) {
  if (source.includes(attribute)) return { source, changed: false };
  const matches = [...source.matchAll(new RegExp(`<${tag}(?=[\\s>])`, "g"))];
  if (matches.length !== 1) return { source, changed: false, note: `<${tag}> not found unambiguously` };
  return { source: source.replace(matches[0][0], `<${tag} ${attribute}`), changed: true };
}

/**
 * Insert markup as the last child of <body>, on its own line indented one
 * step inside the body when </body> starts its line, else just before it.
 * Skipped when `marker` (e.g. "<AstralisDevTools") is already in the file.
 */
export function insertBeforeBodyClose(source, markup, marker = markup) {
  if (source.includes(marker)) return { source, changed: false };
  const matches = [...source.matchAll(/<\/body>/g)];
  if (matches.length !== 1) return { source, changed: false, note: "</body> not found unambiguously" };
  const at = matches[0].index;
  const lineStart = source.lastIndexOf("\n", at - 1) + 1;
  const before = source.slice(lineStart, at);
  if (/^\s*$/.test(before)) {
    const eol = source.includes("\r\n") ? "\r\n" : "\n";
    return { source: `${source.slice(0, lineStart)}${before}  ${markup}${eol}${source.slice(lineStart)}`, changed: true };
  }
  return { source: source.slice(0, at) + markup + source.slice(at), changed: true };
}

/**
 * Append an element to the one array literal assigned to `property` (Vite's
 * `plugins: [react()]`), matching the array's layout: inline stays inline, one
 * per line stays one per line, a trailing comma stays. Skipped when `marker`
 * already appears inside the array.
 */
export function addArrayElement(source, property, element, marker = element) {
  const ast = parseModule(source);
  if (!ast) return { source, changed: false, note: "the file doesn't parse, so it was left alone" };

  const arrays = [];
  (function walk(node) {
    if (!node || typeof node.type !== "string") return;
    if (
      (node.type === "ObjectProperty" || node.type === "Property") &&
      !node.computed &&
      (node.key.name ?? node.key.value) === property &&
      node.value.type === "ArrayExpression"
    ) {
      arrays.push(node.value);
    }
    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "start" || key === "end") continue;
      const value = node[key];
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object") walk(value);
    }
  })(ast.program);

  if (arrays.length !== 1) return { source, changed: false, note: `no single \`${property}: [...]\` array found` };
  const array = arrays[0];
  if (source.slice(array.start, array.end).includes(marker)) return { source, changed: false };

  const items = array.elements.filter(Boolean);
  if (items.length === 0) {
    return { source: source.slice(0, array.start + 1) + element + source.slice(array.end - 1), changed: true };
  }
  const last = items.at(-1);
  const multiline = source.slice(array.start, array.end).includes("\n");
  if (!multiline) return { source: `${source.slice(0, last.end)}, ${element}${source.slice(last.end)}`, changed: true };
  const lineStart = source.lastIndexOf("\n", last.start - 1) + 1;
  const indent = source.slice(lineStart, last.start).match(/^\s*/)[0];
  const eol = source.includes("\r\n") ? "\r\n" : "\n";
  return { source: `${source.slice(0, last.end)},${eol}${indent}${element}${source.slice(last.end)}`, changed: true };
}

/** Insert markup right after the opening <body ...> tag. */
export function insertAfterBodyTag(source, insert) {
  if (source.includes(insert.trim())) return { source, changed: false };
  const matches = [...source.matchAll(/<body[^>]*>/g)];
  if (matches.length !== 1) return { source, changed: false, note: "<body> tag not found unambiguously" };
  const at = matches[0].index + matches[0][0].length;
  return { source: source.slice(0, at) + insert + source.slice(at), changed: true };
}
