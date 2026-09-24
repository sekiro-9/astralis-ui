import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The issue platform's database tests: the real queries against a real
 * Postgres. Kept out of `pnpm test`, which must run anywhere; these need the
 * local database (`docker compose up -d`) and run with `pnpm test:db`.
 *
 * They use their own database, astralis_issues_test beside the development
 * one, created and migrated by the global setup, so a run never touches data
 * you are looking at in the browser.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
      // server-only throws outside a React Server Components build; these
      // modules are server-only, and the test runner is the server.
      "server-only": path.resolve(dirname, "src/server/db/test/empty.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.db.test.ts"],
    globalSetup: ["src/server/db/test/global-setup.ts"],
    setupFiles: ["src/server/db/test/env.ts"],
    // One database: files must not truncate each other's rows mid-test.
    fileParallelism: false,
  },
});
