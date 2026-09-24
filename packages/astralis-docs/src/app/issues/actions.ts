"use server";

import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { safeReturnPath } from "@/lib/issues/format";
import { auth, canSignIn, currentUser } from "@/server/auth";
import { addComment, issueHref, IssueError, submitReport } from "@/server/issues";

// Every action checks the session itself: a server action is reachable by a
// direct POST, not only through the form that shows it.

export interface FormState {
  error: string | null;
  /** Bumped on success, so a form can clear itself. */
  done?: number;
}

const text = (form: FormData, key: string): string => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

/** Start GitHub sign-in and come back to the page that asked. */
export async function signIn(form: FormData): Promise<void> {
  if (!canSignIn()) throw new Error("GitHub sign-in is not configured on this site.");
  const { url } = await auth().api.signInSocial({
    body: { provider: "github", callbackURL: safeReturnPath(text(form, "return")), disableRedirect: true },
    headers: await headers(),
  });
  if (!url) throw new Error("GitHub sign-in did not return an address to continue at.");
  redirect(url);
}

export async function signOut(): Promise<void> {
  await auth().api.signOut({ headers: await headers() });
  redirect("/issues");
}

export async function submitDraft(_: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in with GitHub to submit." };
  const join = text(form, "join");
  let issue: { id: string; githubNumber: number | null };
  try {
    issue = await submitReport({
      draftId: text(form, "draft"),
      userId: user.id,
      description: { title: text(form, "title"), happened: text(form, "happened"), expected: text(form, "expected") },
      joinIssueId: join && join !== "new" ? join : null,
    });
  } catch (error) {
    if (error instanceof IssueError) return { error: error.message };
    throw error;
  }
  revalidatePath("/issues");
  redirect(issueHref(issue));
}

export async function postComment(state: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in with GitHub to comment." };
  try {
    await addComment(text(form, "issue"), user.id, text(form, "body"));
  } catch (error) {
    if (error instanceof IssueError) return { error: error.message };
    throw error;
  }
  revalidatePath(safeReturnPath(text(form, "return")));
  return { error: null, done: (state.done ?? 0) + 1 };
}

export async function deleteAccount(_: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "You are not signed in." };
  if (text(form, "confirm") !== (user.login ?? user.name)) {
    return { error: "Type your GitHub username exactly to confirm." };
  }
  try {
    await auth().api.deleteUser({ body: {}, headers: await headers() });
  } catch (error) {
    // Deleting needs a sign-in from the last day, so a stolen old session
    // cannot do it.
    if (error instanceof APIError) return { error: "For your safety, sign out and sign in again, then delete the account." };
    throw error;
  }
  revalidatePath("/issues");
  redirect("/issues?account=deleted");
}
