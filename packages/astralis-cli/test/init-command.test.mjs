import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parses } from "../src/lib/edits.mjs";
import { tempProject, runCli } from "./helpers.mjs";

/* init against real project shapes. astralis-ui is already a dependency, so nothing installs. */

const NEXT_LAYOUT = `import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

const VITE_MAIN = `import {
  StrictMode,
} from 'react'
import { createRoot } from 'react-dom/client'
import { AstralisProvider, Button } from 'astralis-ui'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`;

const next = (layout = NEXT_LAYOUT) =>
  tempProject({
    "package.json": { name: "x", dependencies: { next: "16", react: "19", "astralis-ui": "*" } },
    "app/layout.tsx": layout,
  });

test("init wires a Next layout whose last import spans lines, and it still parses", async () => {
  const project = next();
  try {
    const result = await runCli(["init"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    const layout = readFileSync(join(project.dir, "app/layout.tsx"), "utf8");
    assert.ok(parses(layout), layout);
    assert.match(layout, /import "\.\/globals\.css";\nimport \{ AstralisProvider \} from "astralis-ui";\nimport "astralis-ui\/styles\.css";/);
    assert.match(layout, /<AstralisProvider defaultTheme="system">\{children\}<\/AstralisProvider>/);
    assert.match(layout, /<html suppressHydrationWarning lang="en">/);
    assert.match(layout, /<body>\n\s+<script dangerouslySetInnerHTML=\{\{ __html: astralisThemeInit \}\} \/>/);
    assert.match(result.stdout, /Done\./);
  } finally {
    project.cleanup();
  }
});

test("a second init changes nothing and says so", async () => {
  const project = next();
  try {
    await runCli(["init"], { cwd: project.dir });
    const once = readFileSync(join(project.dir, "app/layout.tsx"), "utf8");
    const again = await runCli(["init"], { cwd: project.dir });
    assert.equal(again.code, 0);
    assert.match(again.stdout, /already present in this project/);
    assert.equal(readFileSync(join(project.dir, "app/layout.tsx"), "utf8"), once);
  } finally {
    project.cleanup();
  }
});

/* CLI-F2 through the command: the provider import already existed in single quotes. */
test("init on a Vite entry that already imports AstralisProvider adds no second import", async () => {
  const project = tempProject({
    "package.json": { name: "x", dependencies: { react: "19", "astralis-ui": "*" }, devDependencies: { vite: "7" } },
    "src/main.tsx": VITE_MAIN,
  });
  try {
    const result = await runCli(["init"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    const main = readFileSync(join(project.dir, "src/main.tsx"), "utf8");
    assert.ok(parses(main), main);
    assert.equal(main.match(/AstralisProvider[,\s}]/g).length, 1 + 1, "one import specifier, one opening tag");
    assert.match(main, /import App from '\.\/App\.tsx'\nimport 'astralis-ui\/styles\.css'\n/);
  } finally {
    project.cleanup();
  }
});

/* CLI-F21: a dry run ended with "Done. Try it:". */
test("--dry-run writes nothing and doesn't claim it did", async () => {
  const project = next();
  try {
    const result = await runCli(["init", "--dry-run"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.equal(readFileSync(join(project.dir, "app/layout.tsx"), "utf8"), NEXT_LAYOUT);
    assert.match(result.stdout, /would update app\/layout\.tsx/);
    assert.match(result.stdout, /Dry run: nothing was written/);
    assert.doesNotMatch(result.stdout, /Done\./);
  } finally {
    project.cleanup();
  }
});

test("an entry file that doesn't parse is left alone, with the manual steps", async () => {
  const broken = "import {\n  StrictMode,\nfrom 'react'\n";
  const project = tempProject({
    "package.json": { name: "x", dependencies: { react: "19", "astralis-ui": "*" }, devDependencies: { vite: "7" } },
    "src/main.tsx": broken,
  });
  try {
    const result = await runCli(["init"], { cwd: project.dir });
    assert.equal(readFileSync(join(project.dir, "src/main.tsx"), "utf8"), broken);
    assert.match(result.stdout, /doesn't parse/);
    assert.match(result.stdout, /Manual setup/);
  } finally {
    project.cleanup();
  }
});

test("init outside a project, or in a non-React Vite app, says what's missing", async () => {
  const empty = tempProject();
  const vue = tempProject({ "package.json": { name: "x", dependencies: { vue: "3" }, devDependencies: { vite: "7" } } });
  try {
    const none = await runCli(["init"], { cwd: empty.dir });
    assert.equal(none.code, 1);
    assert.match(none.stderr, /No package\.json here/);
    const notReact = await runCli(["init"], { cwd: vue.dir });
    assert.match(notReact.stdout, /Vite project, but not a React one/);
  } finally {
    empty.cleanup();
    vue.cleanup();
  }
});
