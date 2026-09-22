import { test } from "node:test";
import assert from "node:assert/strict";
import { addImports, wrapJsx, addTagAttribute, insertAfterBodyTag, addStatementAfterImports, parses, insertBeforeBodyClose, addArrayElement } from "../src/lib/edits.mjs";

const LAYOUT = `import type { Metadata } from "next";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

test("addImports inserts missing lines after the last import", () => {
  const { source, changed } = addImports(LAYOUT, ['import "astralis-ui/styles.css";']);
  assert.equal(changed, true);
  assert.match(source, /globals\.css";\nimport "astralis-ui\/styles\.css";/);
});

test("addImports is idempotent", () => {
  const once = addImports(LAYOUT, ['import "astralis-ui/styles.css";']).source;
  const twice = addImports(once, ['import "astralis-ui/styles.css";']);
  assert.equal(twice.changed, false);
  assert.equal(twice.source, once);
});

test("addImports handles files with no imports", () => {
  const { source, changed } = addImports("export const x = 1;\n", ["import y from \"z\";"]);
  assert.equal(changed, true);
  assert.ok(source.startsWith("import y"));
});

test("wrapJsx wraps a single occurrence", () => {
  const { source, changed } = wrapJsx(LAYOUT, "{children}", "<P>", "</P>");
  assert.equal(changed, true);
  assert.ok(source.includes("<P>{children}</P>"));
});

test("wrapJsx declines on multiple occurrences", () => {
  const doubled = LAYOUT + "\n// {children}";
  const result = wrapJsx(doubled, "{children}", "<P>", "</P>");
  assert.equal(result.changed, false);
  assert.match(result.note, /2 times/);
});

test("wrapJsx declines when target is absent", () => {
  const result = wrapJsx("<div />", "{children}", "<P>", "</P>");
  assert.equal(result.changed, false);
  assert.ok(result.note);
});

test("addTagAttribute adds once and only once", () => {
  const first = addTagAttribute(LAYOUT, "html", "suppressHydrationWarning");
  assert.equal(first.changed, true);
  assert.ok(first.source.includes("<html suppressHydrationWarning lang="));
  const second = addTagAttribute(first.source, "html", "suppressHydrationWarning");
  assert.equal(second.changed, false);
});

test("insertAfterBodyTag inserts after the opening tag", () => {
  const { source, changed } = insertAfterBodyTag(LAYOUT, "<script />");
  assert.equal(changed, true);
  assert.ok(source.includes("<body><script />"));
});

test("addStatementAfterImports places statement after import block", () => {
  const { source, changed } = addStatementAfterImports(LAYOUT, "const themeInit = `x`;");
  assert.equal(changed, true);
  assert.match(source, /globals\.css";\n\nconst themeInit/);
});

/* CLI-F1: a regex over single lines put new imports INSIDE a multi-line import. */
test("addImports lands after a multi-line last import, not inside it", () => {
  const source = `import { createRoot } from "react-dom/client";
import {
  StrictMode,
} from "react";

createRoot(root).render(<StrictMode />);
`;
  const { source: next, changed } = addImports(source, ['import "astralis-ui/styles.css";']);
  assert.equal(changed, true);
  assert.ok(parses(next));
  assert.match(next, /\} from "react";\nimport "astralis-ui\/styles\.css";\n/);
});

test("addStatementAfterImports lands after a multi-line last import", () => {
  const source = `import {\n  a,\n} from "a";\n\nexport default 1;\n`;
  const { source: next } = addStatementAfterImports(source, "const x = 1;");
  assert.ok(parses(next));
  assert.match(next, /\} from "a";\n\nconst x = 1;/);
});

/* CLI-F2: detection by exact text missed an existing import written differently. */
test("addImports sees a named import that is already there, whatever its quotes", () => {
  const source = `import { AstralisProvider, Button } from 'astralis-ui'\n\nexport const x = 1\n`;
  const result = addImports(source, ['import { AstralisProvider } from "astralis-ui";']);
  assert.equal(result.changed, false);
  assert.equal(result.source, source);
});

test("addImports merges a missing name into the existing import of that module", () => {
  const source = `import {\n  Button,\n} from "astralis-ui";\n`;
  const { source: next, changed } = addImports(source, ['import { AstralisProvider } from "astralis-ui";']);
  assert.equal(changed, true);
  assert.ok(parses(next));
  assert.equal(next.match(/from "astralis-ui"/g).length, 1);
  assert.match(next, /Button, AstralisProvider,/);
});

test("a type-only import does not count as providing the value", () => {
  const source = `import type { AstralisProvider } from "astralis-ui";\n`;
  const { source: next, changed } = addImports(source, ['import { AstralisProvider } from "astralis-ui";']);
  assert.equal(changed, true);
  assert.match(next, /\nimport \{ AstralisProvider \} from "astralis-ui";/);
});

test("new imports follow the file's quote and semicolon style", () => {
  const source = `import { createRoot } from 'react-dom/client'\n\ncreateRoot(root)\n`;
  const { source: next } = addImports(source, [
    'import { AstralisProvider } from "astralis-ui";',
    'import "astralis-ui/styles.css";',
  ]);
  assert.match(next, /^import \{ createRoot \} from 'react-dom\/client'\nimport \{ AstralisProvider \} from 'astralis-ui'\nimport 'astralis-ui\/styles\.css'\n/);
});

test("a side-effect import is satisfied by any import of that module", () => {
  const source = `import 'astralis-ui/styles.css'\n`;
  assert.equal(addImports(source, ['import "astralis-ui/styles.css";']).changed, false);
});

test("addImports goes after a directive when the file has no imports", () => {
  const { source } = addImports(`"use client";\n\nexport const x = 1;\n`, ['import "a.css";']);
  assert.match(source, /^"use client";\nimport "a\.css";\n/);
});

test("a trailing comment on the last import stays on its line", () => {
  const { source } = addImports(`import a from "a"; // keep\nuse(a);\n`, ['import "b";']);
  assert.equal(source, `import a from "a"; // keep\nimport "b";\nuse(a);\n`);
});

test("an unparseable file is declined with a note, never edited", () => {
  const broken = "import {\n";
  const result = addImports(broken, ['import "x";']);
  assert.equal(result.changed, false);
  assert.equal(result.source, broken);
  assert.ok(result.note);
});

test("insertBeforeBodyClose puts markup on its own line inside a multi-line body", () => {
  const source = "<html>\n  <body>\n    {children}\n  </body>\n</html>\n";
  const { source: out, changed } = insertBeforeBodyClose(source, "<X />");
  assert.equal(changed, true);
  assert.equal(out, "<html>\n  <body>\n    {children}\n    <X />\n  </body>\n</html>\n");
  assert.equal(insertBeforeBodyClose(out, "<X />").changed, false, "idempotent");
});

test("insertBeforeBodyClose goes inline when the body is on one line, and keeps CRLF files CRLF", () => {
  assert.equal(insertBeforeBodyClose("<body>{children}</body>", "<X />").source, "<body>{children}<X /></body>");
  assert.equal(
    insertBeforeBodyClose("<body>\r\n  a\r\n</body>\r\n", "<X />").source,
    "<body>\r\n  a\r\n  <X />\r\n</body>\r\n",
  );
});

test("insertBeforeBodyClose declines without exactly one </body>, and honours its marker", () => {
  assert.match(insertBeforeBodyClose("<div />", "<X />").note, /not found unambiguously/);
  assert.equal(insertBeforeBodyClose("<body><X a /></body>", "<X />", "<X").changed, false);
});

test("addArrayElement matches the array's layout", () => {
  const inline = addArrayElement("export default { plugins: [react()] };", "plugins", "x()");
  assert.equal(inline.source, "export default { plugins: [react(), x()] };");
  const empty = addArrayElement("export default { plugins: [] };", "plugins", "x()");
  assert.equal(empty.source, "export default { plugins: [x()] };");
  const trailing = addArrayElement("export default {\n  plugins: [\n    react(),\n    tailwind(),\n  ],\n};\n", "plugins", "x()");
  assert.equal(trailing.source, "export default {\n  plugins: [\n    react(),\n    tailwind(),\n    x(),\n  ],\n};\n");
  const bare = addArrayElement("export default {\n  plugins: [\n    react()\n  ]\n};\n", "plugins", "x()");
  assert.equal(bare.source, "export default {\n  plugins: [\n    react(),\n    x()\n  ]\n};\n");
});

test("addArrayElement finds the array inside defineConfig and config functions, once", () => {
  const fn = 'export default defineConfig(({ mode }) => ({ plugins: [react()], base: "/" }));';
  assert.equal(addArrayElement(fn, "plugins", "x()").source, 'export default defineConfig(({ mode }) => ({ plugins: [react(), x()], base: "/" }));');
  assert.equal(addArrayElement("export default { plugins: [react(), x()] };", "plugins", "x()", "x(").changed, false);
  assert.match(addArrayElement("export default {};", "plugins", "x()").note, /no single/);
  assert.match(addArrayElement("a({ plugins: [] }); b({ plugins: [] });", "plugins", "x()").note, /no single/);
  assert.match(addArrayElement("export default {", "plugins", "x()").note, /doesn't parse/);
});
