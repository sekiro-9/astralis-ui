import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type Database = ReturnType<typeof connect>;

function connect(url: string) {
  // A transaction pooler hands out a different backend per checkout and cannot
  // keep prepared statements alive between queries.
  return drizzle({ client: postgres(url, { prepare: false, max: 5 }), schema });
}

/** Whether the issue platform has a database. The rest of the site never needs one. */
export const isConfigured = (): boolean => Boolean(process.env.DATABASE_URL);

// Cached on the global so a dev-server reload reuses the pool instead of
// opening another and leaving the old one connected.
const cache = globalThis as typeof globalThis & { issuesDb?: Database };

/** Connects on first use: `next build` renders the docs and needs no database. */
export function db(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. See .env.example in astralis-docs.");
  cache.issuesDb ??= connect(url);
  return cache.issuesDb;
}
