import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";

import { db } from "./db/client";
import * as schema from "./db/schema";

type Auth = ReturnType<typeof create>;

/** Whether GitHub sign-in has credentials. Without them /issues is read-only. */
export const canSignIn = (): boolean =>
  Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.BETTER_AUTH_SECRET);

function create() {
  return betterAuth({
    database: drizzleAdapter(db(), {
      provider: "pg",
      schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
    }),
    // GitHub is the only way in: no passwords, no email sign-up.
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        mapProfileToUser: (profile) => ({ login: profile.login }),
        // A renamed GitHub account shows its new name and avatar on next sign-in.
        overrideUserInfoOnSignIn: true,
      },
    },
    user: {
      additionalFields: { login: { type: "string", required: false, input: false } },
      // The data protection promise (FYP report, Section 5.4): a user can
      // delete their account. Their reports and comments stay with the issue,
      // unattributed, through the `set null` references in the schema.
      deleteUser: { enabled: true },
    },
    // Without this a server action that changes the session reaches the
    // browser without its cookie.
    plugins: [nextCookies()],
  });
}

const cache = globalThis as typeof globalThis & { issuesAuth?: Auth };

/** Built on first use, for the same reason as `db()`. */
export function auth(): Auth {
  cache.issuesAuth ??= create();
  return cache.issuesAuth;
}

export interface SignedInUser {
  id: string;
  name: string;
  login: string | null;
  image: string | null;
}

/** The signed-in user for this request, or null. */
export async function currentUser(): Promise<SignedInUser | null> {
  // Reading a session needs only the database and the secret; GitHub is
  // needed to start one, not to recognise one.
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) return null;
  const session = await auth().api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, image } = session.user;
  const login = (session.user as { login?: string | null }).login ?? null;
  return { id, name, login, image: image ?? null };
}
