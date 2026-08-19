/// <reference types="vitest/config" />
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

/**
 * The client/server boundary lives in SOURCE directives: a module that is
 * genuinely client carries "use client" at the top of its .ts/.tsx file, and
 * the build MIRRORS that into dist (rollup strips module-level directives from
 * output, so the banner re-stamps them — but only where the source declared
 * one). Everything else ships as a server module: Server Components importing
 * the barrel get real objects for static components and client references only
 * for interactive ones. scripts/check-server-safe.mjs asserts dist matches
 * source and that the curated static set stays fully server.
 */
// Forward slashes: rollup module ids are posix-style even on Windows.
const srcDir = path
  .resolve(path.dirname(fileURLToPath(import.meta.url)), "src")
  .replace(/\\/g, "/");

const sourceIsClient = new Map<string, boolean>();
function hasUseClientDirective(file: string): boolean {
  let cached = sourceIsClient.get(file);
  if (cached === undefined) {
    cached = readFileSync(file, "utf8").trimStart().startsWith('"use client"');
    sourceIsClient.set(file, cached);
  }
  return cached;
}

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      rollupTypes: true,
    }),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
    },
    rollupOptions: {
      // Externalize every bare import (peers AND runtime deps) — a library
      // ships references, not copies; consumers resolve them from their own
      // node_modules, which keeps dist small and dedupes shared packages.
      external: (id) => !id.startsWith(".") && !path.isAbsolute(id),
      // Rollup drops module-level "use client" from bundled output and warns
      // about each one; the banner above re-stamps them, so the warning is
      // noise here (144 of them, drowning out anything real).
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes("use client")) return;
        warn(warning);
      },
      output: {
        // One output module per source module: bundlers tree-shake at file
        // granularity and RSC client boundaries stay per-module instead of
        // marking the whole library with one blanket directive.
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        banner: (chunk) => {
          const id = chunk.facadeModuleId?.replace(/\\/g, "/");
          return id && id.startsWith(srcDir) && hasUseClientDirective(chunk.facadeModuleId!)
            ? '"use client";\n'
            : "";
        },
      },
    },
  },
  test: {
    projects: [
      {
        // Fast jsdom behavior tests — the default `pnpm test` target.
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }) as unknown as PluginOption,
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
