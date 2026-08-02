/* ==========================================================================
   ASTRALIS — BLOCK THUMBNAIL PRERENDER
   --------------------------------------------------------------------------
   The gallery shows every block as a live, scaled-down render. Pointing those
   thumbnails at the app's own /preview route meant each card loaded a full
   Next.js document: measured at 17 subresources and 2.34 MB decoded per frame,
   36 frames deep, to paint 95 DOM nodes of markup. The page was booting React
   36 times to show a picture.

   A thumbnail does not need React. It needs markup and a stylesheet.

   So each block is server-rendered once, here, into a standalone HTML file
   with no JavaScript bundle at all. The frames still share one stylesheet URL,
   so it is fetched and cached once for all 36.

   The iframe stays. It is what keeps the preview honest: a block's `lg:`
   breakpoints resolve against the frame's 1440px width rather than the
   browser's, and `min-h-screen` resolves to the frame rather than the page.
   Rendering inline would have broken both.

   The detail page keeps the live /preview route — one frame is cheap, and
   that is where poking at the real thing matters.
   ========================================================================== */

import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildSync } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, "..");
// Workspace siblings by path: neither package exports its package.json, so
// require.resolve cannot reach into them.
const PACKAGES = join(DOCS, "..");
const BLOCKS = join(PACKAGES, "astralis-blocks");
const UI = join(PACKAGES, "astralis-ui");
const OUT = join(DOCS, "public", "block-thumbs");

const { blocks } = JSON.parse(readFileSync(join(BLOCKS, "registry", "index.json"), "utf8"));

/* -------------------------------------------------------------------------- */
/* Render every block to static markup                                        */
/* -------------------------------------------------------------------------- */

// Build inside astralis-blocks so Node resolves react/react-dom from the same
// place the bundle's externals point at — the smoke test's constraint exactly.
const work = join(BLOCKS, "node_modules", ".tmp-thumbs");
mkdirSync(work, { recursive: true });

let rendered;
try {
  const entry = join(BLOCKS, "src", "__thumbs.tsx");
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
      "const out: Record<string, string> = {};",
      "for (const [id, Block] of cases) out[id] = renderToStaticMarkup(<Block />);",
      "process.stdout.write(JSON.stringify(out));",
      "",
    ].join("\n"),
  );

  const bundle = join(work, "thumbs.mjs");
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
      external: ["react", "react/jsx-runtime", "react-dom", "react-dom/server"],
    });
  } finally {
    rmSync(entry, { force: true });
  }

  const chunks = [];
  const write = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => (chunks.push(chunk), true);
  try {
    await import(`file://${bundle}`);
  } finally {
    process.stdout.write = write;
  }
  rendered = JSON.parse(chunks.join(""));
} finally {
  rmSync(work, { recursive: true, force: true });
}

/* -------------------------------------------------------------------------- */
/* Wrap each render in a standalone document                                  */
/* -------------------------------------------------------------------------- */

/**
 * Applies `.astralis-dark` before first paint, reading the same storage key the
 * site's provider owns. Same-origin, so the frame sees the same localStorage —
 * without this a thumbnail flashes light on a dark page. This is the only
 * script in the document, and it is inline: no bundle, no framework.
 */
const THEME_INIT =
  '(function(){try{var t=localStorage.getItem("astralis-ui-theme");' +
  'var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);' +
  'if(d)document.documentElement.classList.add("astralis-dark");}catch(e){}})();';

/**
 * Mirrors the parts of the site's globals.css that a block can see. The font
 * stack drops `var(--font-inter)` — next/font's hashed files belong to the app
 * build and are not addressable from a static file — so thumbnails render in
 * the same fallback a consumer gets before their own font loads.
 */
const BASE_CSS = [
  "html,body{margin:0;padding:0}",
  "body{background-color:var(--astralis-color-surface-base);",
  "color:var(--astralis-color-label-base);",
  "font-family:ui-sans-serif,system-ui,sans-serif;",
  "text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}",
  // The provider's wrapper: Preflight is scoped to .astralis, so without this
  // class the block renders against the browser's default styles.
  ".astralis{min-height:100vh;width:100%}",
  // The frame is not interactive — it is a picture of a block.
  "body{cursor:default}",
].join("");

/**
 * Where a block sits when it is shorter than the frame, matching the live
 * preview route: page-edge furniture reads wrong floating in the middle, so a
 * navbar pins to the top and a footer to the bottom. A single auto margin
 * collapses to zero once the block outgrows the frame, so tall blocks are
 * unaffected.
 */
const placementFor = (category) =>
  category === "navbar"
    ? "margin-bottom:auto"
    : category === "footer"
      ? "margin-top:auto"
      : "margin-top:auto;margin-bottom:auto";

const documentFor = ({ id, name, category }, markup) =>
  [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    `<title>${name} preview</title>`,
    // One URL across all 36 frames, so it is fetched once and cached.
    '<link rel="stylesheet" href="/block-thumbs/styles.css">',
    `<style>${BASE_CSS}</style>`,
    `<script>${THEME_INIT}</script>`,
    "</head>",
    '<body class="astralis">',
    `<div style="display:flex;min-height:100vh;flex-direction:column">`,
    `<div data-block-frame data-block-id="${id}" style="${placementFor(category)}">`,
    markup,
    "</div></div>",
    "</body></html>",
    "",
  ].join("");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// The library's prebuilt stylesheet, copied rather than imported: a static file
// cannot address the hashed CSS the Next build emits.
copyFileSync(join(UI, "dist", "styles.css"), join(OUT, "styles.css"));

let bytes = 0;
for (const block of blocks) {
  const html = documentFor(block, rendered[block.id]);
  writeFileSync(join(OUT, `${block.id}.html`), html);
  bytes += Buffer.byteLength(html);
}

console.log(
  `[astralis] block thumbnails: ${blocks.length} document(s), ` +
    `${Math.round(bytes / 1024)} KB total, 0 JS bundles -> public/block-thumbs`,
);
