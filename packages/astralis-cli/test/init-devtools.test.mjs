import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tempProject, runCli, fakeBin, pathWith } from "./helpers.mjs";

/* `astralis init --devtools` against real project shapes. The packages are
   already dependencies unless a test says otherwise, so nothing installs. */

const LAYOUT = `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

const MULTILINE_LAYOUT = `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
`;

const VITE_CONFIG = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
  ],
});
`;

const MAIN = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

const ROUTE = "app/api/astralis-devtools/[...path]/route.ts";

const deps = { "astralis-ui": "*" };
const devDeps = { "astralis-devtools": "*" };

const nextProject = (files = {}, pkg = {}) =>
  tempProject({
    "package.json": { name: "x", dependencies: { next: "16", react: "19", ...deps }, devDependencies: devDeps, ...pkg },
    "app/layout.tsx": LAYOUT,
    ...files,
  });

const viteProject = (files = {}) =>
  tempProject({
    "package.json": { name: "x", dependencies: { react: "19", ...deps }, devDependencies: { vite: "7", ...devDeps } },
    "src/main.tsx": MAIN,
    "vite.config.ts": VITE_CONFIG,
    ...files,
  });

const read = (dir, path) => readFileSync(join(dir, path), "utf8");

test("Next.js: the overlay goes in the root layout and the bridge gets its route", async () => {
  const project = nextProject();
  try {
    const result = await runCli(["init", "--devtools"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    const layout = read(project.dir, "app/layout.tsx");
    assert.match(layout, /^import \{ AstralisDevTools \} from "astralis-devtools\/next";$/m);
    assert.match(layout, /<AstralisProvider defaultTheme="system">\{children\}<\/AstralisProvider><AstralisDevTools \/><\/body>/);
    assert.equal(read(project.dir, ROUTE), 'export { GET } from "astralis-devtools/next/route";\n');
    assert.match(result.stdout, /wrote the DevTools route/);
    assert.match(result.stdout, /click the ✦ button/);
  } finally {
    project.cleanup();
  }
});

test("Next.js: a body on its own lines gets the overlay on its own line, indented inside it", async () => {
  const project = nextProject({ "app/layout.tsx": MULTILINE_LAYOUT });
  try {
    const result = await runCli(["init", "--devtools"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.match(read(project.dir, "app/layout.tsx"), /<\/AstralisProvider><\/main>\n {8}<AstralisDevTools \/>\n {6}<\/body>/);
  } finally {
    project.cleanup();
  }
});

test("a second init --devtools changes nothing and says so in one line", async () => {
  const project = nextProject();
  try {
    await runCli(["init", "--devtools"], { cwd: project.dir });
    const before = [read(project.dir, "app/layout.tsx"), read(project.dir, ROUTE)];
    const again = await runCli(["init", "--devtools"], { cwd: project.dir });
    assert.equal(again.code, 0, again.output);
    assert.equal(again.stdout.trim().split("\n")[0], "✓ astralis-ui and the DevTools are already set up in this project");
    assert.deepEqual([read(project.dir, "app/layout.tsx"), read(project.dir, ROUTE)], before);
  } finally {
    project.cleanup();
  }
});

test("Next.js: a JavaScript layout under src/app gets a .js route beside it", async () => {
  const project = tempProject({
    "package.json": { name: "x", dependencies: { next: "16", react: "19", ...deps }, devDependencies: devDeps },
    "src/app/layout.jsx": LAYOUT.replace(": { children: React.ReactNode }", ""),
  });
  try {
    const result = await runCli(["init", "--devtools"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.ok(existsSync(join(project.dir, "src/app/api/astralis-devtools/[...path]/route.js")));
  } finally {
    project.cleanup();
  }
});

test("Next.js: a route file that does something else is left alone, with a note", async () => {
  const mine = "export function GET() { return new Response('mine'); }\n";
  const project = nextProject({ [ROUTE]: mine });
  try {
    const result = await runCli(["init", "--devtools"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.equal(read(project.dir, ROUTE), mine);
    assert.match(result.output, /already exists and does something else/);
  } finally {
    project.cleanup();
  }
});

test("Vite: the plugin joins the plugins array in the file's own layout", async () => {
  const project = viteProject();
  try {
    const result = await runCli(["init", "--devtools"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    const config = read(project.dir, "vite.config.ts");
    assert.match(config, /^import \{ astralisDevtools \} from "astralis-devtools\/vite";$/m);
    assert.match(config, /plugins: \[\n {4}react\(\),\n {4}astralisDevtools\(\),\n {2}\]/);
    assert.match(result.stdout, /added the DevTools plugin \(vite\.config\.ts\)/);

    const again = await runCli(["init", "--devtools"], { cwd: project.dir });
    assert.equal(again.stdout.trim().split("\n")[0], "✓ astralis-ui and the DevTools are already set up in this project");
    assert.equal(read(project.dir, "vite.config.ts"), config);
  } finally {
    project.cleanup();
  }
});

test("Vite: a config without a plugins array is left alone, with a note", async () => {
  const bare = 'import { defineConfig } from "vite";\nexport default defineConfig({});\n';
  const project = viteProject({ "vite.config.ts": bare });
  try {
    const result = await runCli(["init", "--devtools"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.equal(read(project.dir, "vite.config.ts"), bare);
    assert.match(result.output, /no single `plugins: \[\.\.\.\]` array found/);
  } finally {
    project.cleanup();
  }
});

test("installs astralis-devtools as a devDependency when it is missing", async () => {
  const project = nextProject({}, { devDependencies: {} });
  const bin = join(project.dir, "bin");
  const log = join(project.dir, "calls.log");
  fakeBin(bin, "npm", `import { appendFileSync } from "node:fs";\nappendFileSync(process.env.FAKE_LOG, JSON.stringify(process.argv.slice(2)) + "\\n");\n`);
  try {
    const result = await runCli(["init", "--devtools"], { cwd: project.dir, env: { ...pathWith(bin), FAKE_LOG: log } });
    assert.equal(result.code, 0, result.output);
    const calls = read(project.dir, "calls.log").trim().split("\n").map((line) => JSON.parse(line));
    assert.deepEqual(calls, [["add", "-D", "astralis-devtools"]]);
  } finally {
    project.cleanup();
  }
});

test("--dry-run shows the DevTools steps and writes nothing", async () => {
  const project = nextProject();
  try {
    const before = read(project.dir, "app/layout.tsx");
    const result = await runCli(["init", "--devtools", "--dry-run"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.equal(read(project.dir, "app/layout.tsx"), before);
    assert.equal(existsSync(join(project.dir, ROUTE)), false);
    assert.match(result.stdout, /would write the DevTools route/);
    assert.match(result.stdout, /Run astralis init --devtools to apply it/);
  } finally {
    project.cleanup();
  }
});

test("plain init leaves the DevTools out", async () => {
  const project = nextProject();
  try {
    const result = await runCli(["init"], { cwd: project.dir });
    assert.equal(result.code, 0, result.output);
    assert.doesNotMatch(read(project.dir, "app/layout.tsx"), /AstralisDevTools/);
    assert.equal(existsSync(join(project.dir, ROUTE)), false);
  } finally {
    project.cleanup();
  }
});
