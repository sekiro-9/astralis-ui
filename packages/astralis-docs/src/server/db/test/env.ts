import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** The test database's name; global-setup.ts creates and migrates it. */
export const TEST_DATABASE = "astralis_issues_test";

/**
 * Point this process at the test database. Runs in the global setup and again
 * in every test worker, since a worker does not inherit what the setup set.
 */
export function pointAtTestDatabase(): string {
  const envFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../.env.local");
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set: start the local database (docker compose up -d) and see .env.example.");
  const test = new URL(url);
  if (test.pathname !== `/${TEST_DATABASE}`) test.pathname = `/${TEST_DATABASE}`;
  process.env.DATABASE_URL = test.toString();
  process.env.BETTER_AUTH_SECRET ||= "test-secret";
  return url;
}

pointAtTestDatabase();
