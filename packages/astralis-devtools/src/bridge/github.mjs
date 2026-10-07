import { checkSnapshot } from "astralis-cli/snapshot";
import {
  GitHubError,
  clientId,
  createIssue,
  finishSignIn,
  issueFromSnapshot,
  issuesRepo,
  listIssues,
  startSignIn,
  tokenStore,
} from "astralis-cli/github";

/* The bridge's GitHub session: signing in with a code, the saved sign-in
   (shared with `astralis report`), and the reporter's issues. The token stays
   in this process and in the user's config file; the page only ever learns
   the login, the code to enter, and the issues. */

export class GitHubSession {
  constructor({ store = tokenStore(), fetchImpl = globalThis.fetch, sleep } = {}) {
    this.store = store;
    this.fetchImpl = fetchImpl;
    this.sleep = sleep;
    this.pending = null; // { userCode, verificationUri, expiresAt, controller }
    this.error = null; // the last sign-in's failure, shown once
  }

  /** What the page may know: whether sign-in is set up, who is signed in, and a sign-in under way. */
  status() {
    const saved = this.store.read();
    const pending = this.pending && this.pending.expiresAt > Date.now() ? this.pending : null;
    return {
      configured: Boolean(clientId()),
      repo: issuesRepo(),
      login: saved?.login ?? null,
      pending: pending ? { userCode: pending.userCode, verificationUri: pending.verificationUri, expiresAt: pending.expiresAt } : null,
      error: this.error,
    };
  }

  /** Start a sign-in, or return the one under way. GitHub is polled here, not by the page. */
  async signIn() {
    if (this.store.read()) return this.status();
    if (this.pending && this.pending.expiresAt > Date.now()) return this.status();
    this.error = null;
    const flow = await startSignIn({ fetchImpl: this.fetchImpl });
    const controller = new AbortController();
    this.pending = { userCode: flow.userCode, verificationUri: flow.verificationUri, expiresAt: flow.expiresAt, controller };
    const mine = this.pending;
    finishSignIn(flow, { fetchImpl: this.fetchImpl, signal: controller.signal, ...(this.sleep ? { sleep: this.sleep } : {}) })
      .then((signedIn) => {
        if (this.pending === mine) this.store.write(signedIn);
      })
      .catch((error) => {
        if (this.pending === mine && error.code !== "cancelled") this.error = error.message;
      })
      .finally(() => {
        if (this.pending === mine) this.pending = null;
      });
    return this.status();
  }

  signOut() {
    this.pending?.controller.abort();
    this.pending = null;
    this.error = null;
    this.store.clear();
    return this.status();
  }

  /** The saved token, or a GitHubError saying to sign in. */
  #token() {
    const saved = this.store.read();
    if (!saved) throw new GitHubError("signed-out", "Sign in with GitHub first.");
    return saved;
  }

  /** Run `work` with the token; a token GitHub no longer accepts is forgotten. */
  async #withToken(work) {
    const saved = this.#token();
    try {
      return await work(saved);
    } catch (error) {
      if (error.code === "signed-out") this.store.clear();
      throw error;
    }
  }

  issues() {
    return this.#withToken(({ token, login }) => listIssues(token, login, { fetchImpl: this.fetchImpl }));
  }

  /** Open a confirmed snapshot as an issue. Resolves to { number, url }. */
  submit(snapshot) {
    const problems = checkSnapshot(snapshot);
    if (problems.length) return Promise.reject(new GitHubError("invalid", `The snapshot is not valid: ${problems.join("; ")}`));
    return this.#withToken(({ token }) => createIssue(token, issueFromSnapshot(snapshot), { fetchImpl: this.fetchImpl }));
  }
}

let shared = null;
/** The dev server's one session. */
export const githubSession = () => (shared ??= new GitHubSession());
