import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { STARTER_IMPORTS, starterFile } from "../src/lib/starter.mjs";
import { prepareSpec, validateSource } from "../src/lib/validate-core.mjs";

/*
 * T5: the welcome screen is TSX emitted as text, so no compiler ever sees it.
 * This gate compiles it and renders it to a string through the real library,
 * and runs it past the validator. React and TypeScript are resolved from
 * astralis-ui's own location: the starter must render with the same React
 * instance the library imports, or every hook in it breaks.
 */

const fromLibrary = createRequire(import.meta.resolve("astralis-ui/styles.css"));
const ts = fromLibrary("typescript");
const { createElement } = fromLibrary("react");
const { renderToString } = fromLibrary("react-dom/server");
const ui = await import("astralis-ui");

function compile(source, fileName) {
  const { outputText, diagnostics } = ts.transpileModule(source, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  assert.deepEqual(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")), []);
  const modules = { "astralis-ui": ui, "react/jsx-runtime": fromLibrary("react/jsx-runtime") };
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (id) => modules[id] ?? assert.fail(`the starter imports ${id}, which it may not`),
    module,
    module.exports,
  );
  return module.exports.default;
}

for (const [framework, entry] of [["next", "/p/app/layout.tsx"], ["vite", "/p/src/main.tsx"], ["vite", "/p/src/main.jsx"]]) {
  test(`the ${framework} starter (${entry.slice(-4)}) compiles and renders inside the provider without warnings`, () => {
    const { path, source } = starterFile(framework, entry);
    const Welcome = compile(source, path);
    assert.equal(typeof Welcome, "function");

    const logged = [];
    const { error, warn } = console;
    console.error = (...args) => logged.push(args.join(" "));
    console.warn = (...args) => logged.push(args.join(" "));
    let html;
    try {
      html = renderToString(createElement(ui.AstralisProvider, { defaultTheme: "light" }, createElement(Welcome)));
    } finally {
      console.error = error;
      console.warn = warn;
    }

    assert.deepEqual(logged, []);
    assert.match(html, /set up\./);
    assert.match(html, /href="https:\/\/astralis-ui\.com\/docs\/quick-start"/);
    assert.match(html, /aria-label="Toggle theme"/);
  });
}

test("the starter passes the validator it ships alongside", () => {
  const spec = JSON.parse(readFileSync(new URL(import.meta.resolve("astralis-ui/system-spec.json")), "utf8"));
  const { source } = starterFile("next", "/p/app/layout.tsx");
  const { errors, warnings } = validateSource(source, prepareSpec(spec), "page.tsx");
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  assert.ok(STARTER_IMPORTS.every((name) => source.includes(name)));
});
