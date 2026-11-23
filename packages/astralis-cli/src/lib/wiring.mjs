import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { posix } from "./ui.mjs";
import { tryRead } from "./manual.mjs";

/** The lines that wire Astralis into an app, shared by init's edits and the steps it prints instead. */

export const PROVIDER_IMPORT = 'import { AstralisProvider } from "astralis-ui";';
export const STYLES_IMPORT = 'import "astralis-ui/styles.css";';
export const PROVIDER_OPEN = '<AstralisProvider defaultTheme="system">';
export const PROVIDER_CLOSE = "</AstralisProvider>";

// Applies `.astralis-dark` before first paint so a stored/system dark
// preference never flashes light (same script the Astralis docs site uses).
export const THEME_INIT_CONST =
  'const astralisThemeInit = `(function(){try{var t=localStorage.getItem("astralis-ui-theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("astralis-dark");}catch(e){}})();`;';
export const THEME_INIT_ELEMENT = "<script dangerouslySetInnerHTML={{ __html: astralisThemeInit }} />";

/** The edits each kind of entry file needs, in order. */
export const WIRING = {
  next: ["imports", "provider", "themeScript", "html"],
  nextPages: ["imports", "provider"],
  vite: ["imports", "provider"],
};

const RENDERED = { next: "{children}", nextPages: "<Component {...pageProps} />", vite: "<App />" };

/** The manual step for one of those edits, as guide.step()'s arguments. */
export function wiringStep(id, file, kind) {
  const rendered = RENDERED[kind];
  const steps = {
    imports: [`Open ${file} and add these after its other imports:`, `${PROVIDER_IMPORT}\n${STYLES_IMPORT}`],
    provider: [
      `In ${file}, put the provider around what it renders (usually ${rendered}):`,
      `${PROVIDER_OPEN}\n  ${rendered}\n${PROVIDER_CLOSE}`,
    ],
    themeScript: [
      `In ${file}, stop dark mode flashing light. This goes after the imports:`,
      THEME_INIT_CONST,
    ],
    html: [`In ${file} (or the file that holds your <html>), let that script change <html> before React starts:`, '<html lang="en" suppressHydrationWarning>'],
  };
  return id === "themeScript"
    ? [steps.themeScript, [`In ${file} (or the file that holds your <body>), run it as the first thing inside <body>:`, THEME_INIT_ELEMENT]]
    : [steps[id]];
}

/** The whole of a new entry file, for a project that has none. */
export function newEntrySource(kind, file) {
  const typed = /\.tsx$/.test(file);
  if (kind === "vite") {
    return `import { createRoot } from "react-dom/client";
${PROVIDER_IMPORT}
${STYLES_IMPORT}
import App from "./App";

createRoot(document.getElementById("root")${typed ? "!" : ""}).render(
  ${PROVIDER_OPEN}
    <App />
  ${PROVIDER_CLOSE},
);`;
  }
  if (kind === "nextPages") {
    return `${typed ? 'import type { AppProps } from "next/app";\n' : ""}${PROVIDER_IMPORT}
${STYLES_IMPORT}

export default function App({ Component, pageProps }${typed ? ": AppProps" : ""}) {
  return (
    ${PROVIDER_OPEN}
      <Component {...pageProps} />
    ${PROVIDER_CLOSE}
  );
}`;
  }
  return `${PROVIDER_IMPORT}
${STYLES_IMPORT}

${THEME_INIT_CONST}

export default function RootLayout({ children }${typed ? ": { children: React.ReactNode }" : ""}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        ${THEME_INIT_ELEMENT}
        ${PROVIDER_OPEN}{children}${PROVIDER_CLOSE}
      </body>
    </html>
  );
}`;
}

const firstExisting = (cwd, candidates) => candidates.find((path) => existsSync(join(cwd, path))) ?? null;

/** A root layout one folder down, as route groups and [locale] routing have it: app/(site)/layout.tsx. */
function nestedLayout(cwd, appDir) {
  try {
    for (const entry of readdirSync(join(cwd, appDir), { withFileTypes: true })) {
      if (!entry.isDirectory() || !/^[([]/.test(entry.name)) continue;
      const layout = readdirSync(join(cwd, appDir, entry.name)).find((name) => /^layout\.(tsx|jsx|js)$/.test(name));
      if (layout) return `${appDir}/${entry.name}/${layout}`;
    }
  } catch {
    // An unreadable app folder only costs the hint.
  }
  return null;
}

/** The module script index.html loads: Vite's own definition of the entry. */
function viteEntryFromHtml(cwd) {
  const html = tryRead(join(cwd, "index.html")).text ?? "";
  for (const [tag] of html.matchAll(/<script\b[^>]*>/g)) {
    const src = /\bsrc=["']\/?([^"':]+)["']/.exec(tag)?.[1];
    if (src && /\btype=["']module["']/.test(tag)) return posix(src);
  }
  return null;
}

/**
 * Where the wiring most likely goes when findEntryFile() found nothing:
 * { file, exists, kind, appDir }. `kind` picks the steps' code and docs link;
 * `appDir` is where a Next.js route handler belongs.
 */
export function likelyEntry(cwd, framework) {
  const found = (file, rest) => ({ file, exists: existsSync(join(cwd, file)), ...rest });
  if (framework === "vite") {
    const file = viteEntryFromHtml(cwd) ?? firstExisting(cwd, ["src/index.tsx", "src/index.jsx"]) ?? "src/main.tsx";
    return found(file, { kind: "vite", appDir: null });
  }
  const appDir = firstExisting(cwd, ["app", "src/app"]);
  if (appDir) return found(nestedLayout(cwd, appDir) ?? `${appDir}/layout.tsx`, { kind: "next", appDir });
  const pages = firstExisting(cwd, ["pages", "src/pages"]);
  if (pages) {
    const file = firstExisting(cwd, ["tsx", "jsx", "js"].map((ext) => `${pages}/_app.${ext}`)) ?? `${pages}/_app.tsx`;
    return found(file, { kind: "nextPages", appDir: pages === "pages" ? "app" : "src/app" });
  }
  const guess = existsSync(join(cwd, "src")) ? "src/app" : "app";
  return found(`${guess}/layout.tsx`, { kind: "next", appDir: guess });
}

/** Add the steps that wire `ids` into an entry: edits to a file that exists, or the whole of one that doesn't. */
export function addWiringSteps(guide, { file, exists = true, kind }, ids = WIRING[kind]) {
  if (!exists) return guide.step(`Create ${file} (or use the file your app starts from) with:`, newEntrySource(kind, file));
  for (const id of ids) for (const step of wiringStep(id, file, kind)) guide.step(...step);
  return guide;
}
