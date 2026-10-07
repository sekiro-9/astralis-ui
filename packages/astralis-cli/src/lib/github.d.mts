import type { Snapshot } from "./snapshot.mjs";

/** Reporting to GitHub: sign-in through the Astralis DevTools GitHub App, the saved sign-in, and issues. Node only. */

export const GITHUB_CLIENT_ID: string;
export const ISSUES_REPO: string;
/** The app's client ID (ASTRALIS_GITHUB_CLIENT_ID overrides it). Empty when sign-in is not set up. */
export function clientId(): string;
/** The repository reports go to (ASTRALIS_ISSUES_REPO overrides it). */
export function issuesRepo(): string;

export type GitHubErrorCode = "network" | "signed-out" | "forbidden" | "github" | "not-configured" | "expired" | "denied" | "cancelled";
export class GitHubError extends Error {
  code: GitHubErrorCode;
}

export interface SavedSignIn {
  token: string;
  login: string;
  savedAt: string;
}
/** The user's config directory for Astralis. */
export function configDir(env?: Record<string, string | undefined>): string;
export function tokenStore(dir?: string): {
  file: string;
  read(): SavedSignIn | null;
  write(signIn: { token: string; login: string }): void;
  clear(): void;
};

export interface SignInFlow {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresAt: number;
  interval: number;
}
interface FetchOptions {
  fetchImpl?: typeof fetch;
}
export function startSignIn(options?: FetchOptions): Promise<SignInFlow>;
export function finishSignIn(
  flow: SignInFlow,
  options?: FetchOptions & { sleep?: (ms: number) => Promise<void>; signal?: AbortSignal },
): Promise<{ token: string; login: string }>;

export interface IssueSummary {
  number: number;
  title: string;
  state: "open" | "closed";
  stateReason: string | null;
  url: string;
  comments: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}
export function createIssue(token: string, issue: { title: string; body: string }, options?: FetchOptions): Promise<{ number: number; url: string }>;
export function listIssues(token: string, login: string, options?: FetchOptions): Promise<IssueSummary[]>;
/** The title and Markdown body of the issue a snapshot becomes. */
export function issueFromSnapshot(snapshot: Snapshot): { title: string; body: string };
