import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Tests for the docs site's pure logic — the playground's control derivation
 * and code generation.
 *
 * `node` environment on purpose: these modules are deliberately React-free, and
 * keeping them that way is what makes them cheap to test. If a test ever needs
 * a DOM, that's a signal the logic drifted into a component and should move
 * back out rather than a reason to switch environments.
 */
export default defineConfig({
  resolve: {
    // Mirrors the "@/*" -> "./src/*" mapping in tsconfig.json.
    alias: { "@": path.resolve(dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
