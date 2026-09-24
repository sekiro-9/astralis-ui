import path from "node:path";
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Importing env.ts points this process at the test database.
import { TEST_DATABASE } from "./env";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Creates the test database on the same server as the development one and
 * applies every migration: the tests run against the schema the migrations
 * produce, not against its TypeScript description.
 */
export default async function setup() {
  const url = process.env.DATABASE_URL!;
  const server = new URL(url);
  server.pathname = "/postgres";
  const admin = postgres(server.toString(), { max: 1, onnotice: () => {} });
  const [exists] = await admin`select 1 from pg_database where datname = ${TEST_DATABASE}`;
  if (!exists) await admin.unsafe(`create database ${TEST_DATABASE}`);
  await admin.end();

  const client = postgres(url, { max: 1, onnotice: () => {} });
  await migrate(drizzle({ client }), { migrationsFolder: path.resolve(here, "../migrations") });
  await client.end();
}
