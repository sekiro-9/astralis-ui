#!/usr/bin/env node
/**
 * Builds each bench app and extracts the First Load JS numbers from the
 * `next build` route table. Usage:
 *
 *   node bench/measure.mjs            # every app under bench/apps/
 *   node bench/measure.mjs astralis   # one app
 *
 * Prints a markdown table (paste target: reports/bench-hydration.md).
 * The app must already have its dependencies installed.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const benchDir = dirname(fileURLToPath(import.meta.url));
const appsDir = join(benchDir, "apps");

const requested = process.argv.slice(2);
const apps = (requested.length ? requested : readdirSync(appsDir)).filter((name) =>
  existsSync(join(appsDir, name, "package.json")),
);

if (apps.length === 0) {
  console.error("No bench apps found. Expected bench/apps/<lib>/package.json.");
  process.exit(1);
}

/**
 * First Load JS for the "/" route, computed from the build manifests (Next 16's
 * Turbopack build no longer prints the size table). Matches Next's historical
 * definition: the route's client chunks plus the chunks shared by every page
 * (rootMainFiles), polyfills excluded. Reported raw and gzipped.
 */
function measureApp(cwd, document = "index.html") {
  const nextDir = join(cwd, ".next");
  // Next 16 (Turbopack) no longer writes app-build-manifest.json, so the
  // prerendered document is the ground truth: every /_next/static/*.js it
  // references (script tags AND flight-preloaded chunk refs) is JS a first
  // visit downloads to hydrate this route.
  const html = readFileSync(join(nextDir, "server", "app", document), "utf8");
  const files = new Set(
    [...html.matchAll(/\/_next\/(static\/[^"'\\ ]+?\.js)/g)].map((m) => m[1]),
  );
  // Exclude polyfills + the low-priority manifest stubs, matching Next's own
  // First Load JS definition.
  const buildManifest = JSON.parse(readFileSync(join(nextDir, "build-manifest.json"), "utf8"));
  for (const f of [...(buildManifest.polyfillFiles ?? []), ...(buildManifest.lowPriorityFiles ?? [])]) {
    files.delete(f);
  }

  let raw = 0;
  let gzip = 0;
  for (const file of files) {
    const path = join(nextDir, file);
    raw += statSync(path).size;
    gzip += gzipSync(readFileSync(path)).length;
  }
  return { files: files.size, raw, gzip };
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

const results = [];
for (const app of apps) {
  const cwd = join(appsDir, app);
  const nextBin = join(cwd, "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(nextBin)) {
    console.error(`[${app}] next is not installed — run npm install in bench/apps/${app} first.`);
    process.exitCode = 1;
    continue;
  }
  console.error(`[${app}] next build …`);
  const run = spawnSync(process.execPath, [nextBin, "build"], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    maxBuffer: 32 * 1024 * 1024,
  });
  const output = `${run.stdout ?? ""}\n${run.stderr ?? ""}`;
  if (run.status !== 0) {
    console.error(`[${app}] build FAILED (exit ${run.status}):\n${output.slice(-3000)}`);
    process.exitCode = 1;
    continue;
  }
  try {
    results.push({ app, ...measureApp(cwd) });
    // A bench app may carry an /empty route as the framework floor.
    if (existsSync(join(cwd, ".next", "server", "app", "empty.html"))) {
      results.push({ app: `${app} (empty route floor)`, ...measureApp(cwd, "empty.html") });
    }
  } catch (error) {
    console.error(`[${app}] could not read build manifests: ${error.message}`);
    process.exitCode = 1;
  }
}

if (results.length) {
  console.log(`\n| App | JS files (/) | First Load JS raw | First Load JS gzip |`);
  console.log(`| --- | --- | --- | --- |`);
  for (const r of results) {
    console.log(`| ${r.app} | ${r.files} | ${kb(r.raw)} | ${kb(r.gzip)} |`);
  }
  console.log(`\nMeasured ${new Date().toISOString().slice(0, 10)} — production \`next build\`, default config;`);
  console.log(`all /_next/static JS referenced by the prerendered "/" document, polyfills excluded.`);
}
