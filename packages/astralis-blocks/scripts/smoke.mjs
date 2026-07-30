/* ==========================================================================
   ASTRALIS — BLOCK RENDER SMOKE TEST
   --------------------------------------------------------------------------
   Type-checking proves a block's props are valid; it does not prove the block
   renders. This bundles every registered block against the built astralis-ui
   and server-renders it, so a broken composition fails here rather than in a
   consumer's project after `astralis add`.
   ========================================================================== */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildSync } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const { blocks } = JSON.parse(readFileSync(join(ROOT, "registry", "index.json"), "utf8"));

// Output inside the package so Node resolves the externals from its node_modules.
const work = join(ROOT, "node_modules", ".tmp");
mkdirSync(work, { recursive: true });

try {
  const entry = join(ROOT, "src", "__smoke.tsx");
  writeFileSync(
    entry,
    [
      'import { renderToStaticMarkup } from "react-dom/server";',
      ...blocks.map(
        ({ id, category, component, files }) =>
          `import { ${component} } from "./${category}/${id}/${files[0].replace(/\.tsx$/, "")}";`,
      ),
      "",
      `const cases = [${blocks.map(({ id, component }) => `["${id}", ${component}]`).join(", ")}] as const;`,
      "",
      "for (const [id, Block] of cases) {",
      "  const html = renderToStaticMarkup(<Block />);",
      // Dump before validating, so a failing block can actually be inspected.
      "  if (process.env.DUMP) console.log(html);",
      "  if (!html.trim()) throw new Error(`${id} rendered empty markup`);",
      // A prop-less <Box> legitimately renders class="" — Box is transparent by
      // default. What is never legitimate is a token that failed to resolve.
      "  if (/class=\"[^\"]*(undefined|\\[object Object\\])[^\"]*\"/.test(html)) {",
      "    throw new Error(`${id} emitted an unresolved class — a prop token is wrong`);",
      "  }",
      "  console.log(`[astralis] smoke ${id}: ${html.length} chars`);",
      "}",
      "",
    ].join("\n"),
  );

  const bundle = join(work, "smoke.mjs");
  try {
    buildSync({
      entryPoints: [entry],
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node20",
      outfile: bundle,
      jsx: "automatic",
      logLevel: "silent",
      loader: { ".css": "empty" },
      // Only React stays external: react-dom/server is CJS and must be loaded by
      // Node. astralis-ui IS bundled so its `react` import is rewritten to the
      // same external — a workspace link would otherwise resolve React from its
      // own node_modules and give us two copies.
      external: ["react", "react/jsx-runtime", "react-dom", "react-dom/server"],
    });
  } finally {
    rmSync(entry, { force: true });
  }

  await import(`file://${bundle}`);
  console.log(`[astralis] block smoke: ${blocks.length} block(s) rendered`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
