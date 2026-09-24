import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { fingerprintOf } from "@/lib/issues/fingerprint";
import { parseFilters } from "@/lib/issues/filters";
import { sampleSnapshot } from "@/lib/issues/fixtures";

import { db } from "./db/client";
import { account, comments, drafts, events, issues, reports, session, user } from "./db/schema";
import {
  addComment,
  createDraft,
  findDuplicates,
  getIssue,
  IssueError,
  listIssues,
  RATE_LIMITS,
  readDraft,
  submitReport,
} from "./issues";

beforeEach(async () => {
  await db().execute(sql`truncate ${drafts}, ${issues}, ${reports}, ${comments}, ${events}, ${session}, ${account}, ${user}`);
});

async function makeUser(login: string): Promise<string> {
  const id = randomUUID();
  await db().insert(user).values({ id, name: login, email: `${login}@example.test`, login });
  return id;
}

const refusal = async (promise: Promise<unknown>): Promise<number> => {
  try {
    await promise;
  } catch (error) {
    if (error instanceof IssueError) return error.status;
    throw error;
  }
  throw new Error("expected a refusal");
};

const submitNew = async (userId: string, snapshot = sampleSnapshot()) => {
  const draftId = await createDraft(snapshot, "203.0.113.1");
  return submitReport({ draftId, userId, description: snapshot.description });
};

describe("drafts", () => {
  it("are stored against a hashed address, never the address itself", async () => {
    const id = await createDraft(sampleSnapshot(), "203.0.113.7");
    const draft = await readDraft(id);
    expect(draft?.snapshot.description.title).toBe("Card loses its border with variant glass");
    const [row] = await db().select().from(drafts).where(eq(drafts.id, id));
    expect(row.addressHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(row)).not.toContain("203.0.113.7");
    expect(row.expiresAt.getTime() - row.createdAt.getTime()).toBe(24 * 3600 * 1000);
  });

  it("are unreadable once expired, and the next draft clears them away", async () => {
    const id = await createDraft(sampleSnapshot(), "203.0.113.7");
    await db().update(drafts).set({ expiresAt: sql`now() - interval '1 second'` }).where(eq(drafts.id, id));
    expect(await readDraft(id)).toBeNull();
    await createDraft(sampleSnapshot(), "203.0.113.8");
    expect(await db().select().from(drafts).where(eq(drafts.id, id))).toHaveLength(0);
  });

  it("ignore ids that are not ids", async () => {
    expect(await readDraft("'; drop table drafts; --")).toBeNull();
    expect(await readDraft(randomUUID())).toBeNull();
  });

  it("are rate-limited per address", async () => {
    for (let i = 0; i < RATE_LIMITS.draftsPerAddressPerHour; i++) await createDraft(sampleSnapshot(), "198.51.100.1");
    expect(await refusal(createDraft(sampleSnapshot(), "198.51.100.1"))).toBe(429);
    // Another address is unaffected.
    await expect(createDraft(sampleSnapshot(), "198.51.100.2")).resolves.toBeTruthy();
  });
});

describe("submitting", () => {
  it("opens an issue from a draft, with the fingerprint and the reporter's edits", async () => {
    const ada = await makeUser("ada");
    const draftId = await createDraft(sampleSnapshot(), "203.0.113.1");
    const { id } = await submitReport({
      draftId,
      userId: ada,
      description: { title: "  Glass card is flat  ", happened: " no border ", expected: "" },
    });

    const issue = await getIssue(id);
    expect(issue).toMatchObject({
      title: "Glass card is flat",
      status: "new",
      component: "Card",
      ruleCodes: ["invalid-recipe-value"],
      reportCount: 1,
      fingerprint: fingerprintOf(sampleSnapshot()).value,
    });
    expect(issue!.reports[0].snapshot.description).toEqual({ title: "Glass card is flat", happened: "no border" });
    expect(issue!.reports[0].reporter?.login).toBe("ada");
    expect(issue!.events.map((e) => e.kind)).toEqual(["opened"]);
    expect(await readDraft(draftId)).toBeNull();
  });

  it("cannot submit the same draft twice", async () => {
    const ada = await makeUser("ada");
    const draftId = await createDraft(sampleSnapshot(), "203.0.113.1");
    const description = sampleSnapshot().description;
    const results = await Promise.allSettled([
      submitReport({ draftId, userId: ada, description }),
      submitReport({ draftId, userId: ada, description }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await db().select().from(issues)).toHaveLength(1);
  });

  it("checks edited words with the snapshot schema", async () => {
    const ada = await makeUser("ada");
    const draftId = await createDraft(sampleSnapshot(), "203.0.113.1");
    expect(await refusal(submitReport({ draftId, userId: ada, description: { title: "   " } }))).toBe(422);
    expect(await refusal(submitReport({ draftId, userId: ada, description: { title: "x".repeat(201) } }))).toBe(422);
    expect(await readDraft(draftId)).not.toBeNull();
  });

  it("offers a duplicate and adds the report to it, raising its count", async () => {
    const ada = await makeUser("ada");
    const grace = await makeUser("grace");
    const first = await submitNew(ada);

    const second = sampleSnapshot({ route: "/pricing", description: { title: "Flat glass card" } });
    const offered = await findDuplicates(fingerprintOf(second).value);
    expect(offered.map((d) => d.id)).toEqual([first.id]);

    const draftId = await createDraft(second, "203.0.113.2");
    const joined = await submitReport({ draftId, userId: grace, description: second.description, joinIssueId: first.id });
    expect(joined.id).toBe(first.id);
    const issue = await getIssue(first.id);
    expect(issue?.reportCount).toBe(2);
    expect(issue?.events.map((e) => e.kind)).toEqual(["opened", "report_added"]);
    expect(await db().select().from(issues)).toHaveLength(1);
  });

  it("refuses to add a report to an issue with another fingerprint", async () => {
    const ada = await makeUser("ada");
    const other = await submitNew(ada, sampleSnapshot({ findings: [] }));
    const draftId = await createDraft(sampleSnapshot(), "203.0.113.2");
    expect(await refusal(submitReport({ draftId, userId: ada, description: { title: "x" }, joinIssueId: other.id }))).toBe(409);
  });

  it("does not offer issues that are closed, but does offer a fix not yet released", async () => {
    const ada = await makeUser("ada");
    const { id } = await submitNew(ada);
    const print = fingerprintOf(sampleSnapshot()).value;
    for (const [status, offered] of [["fixed", 1], ["released", 0], ["declined", 0], ["duplicate", 0]] as const) {
      await db().update(issues).set({ status }).where(eq(issues.id, id));
      expect(await findDuplicates(print), status).toHaveLength(offered);
    }
  });

  it("limits how many reports one person submits in an hour", async () => {
    const ada = await makeUser("ada");
    for (let i = 0; i < RATE_LIMITS.reportsPerUserPerHour; i++) await submitNew(ada);
    const draftId = await createDraft(sampleSnapshot(), "203.0.113.1");
    expect(await refusal(submitReport({ draftId, userId: ada, description: { title: "one more" } }))).toBe(429);
  });
});

describe("the public list", () => {
  it("pins open critical issues, then orders by activity, and filters", async () => {
    const ada = await makeUser("ada");
    const card = await submitNew(ada);
    const modal = await submitNew(
      ada,
      sampleSnapshot({ tree: [{ component: "Modal", props: {}, children: [] }], findings: [], description: { title: "Modal" } }),
    );
    await db().update(issues).set({ severity: "critical", updatedAt: sql`now() - interval '2 days'` }).where(eq(issues.id, modal.id));

    const open = await listIssues(parseFilters({}));
    expect(open.issues.map((i) => i.id)).toEqual([modal.id, card.id]);
    expect((await listIssues(parseFilters({ component: "Card" }))).issues.map((i) => i.id)).toEqual([card.id]);
    expect((await listIssues(parseFilters({ rule: "invalid-recipe-value" }))).issues.map((i) => i.id)).toEqual([card.id]);
    expect((await listIssues(parseFilters({ severity: "critical" }))).issues.map((i) => i.id)).toEqual([modal.id]);

    await db().update(issues).set({ status: "released" }).where(eq(issues.id, modal.id));
    expect((await listIssues(parseFilters({}))).issues.map((i) => i.id)).toEqual([card.id]);
    expect((await listIssues(parseFilters({ status: "released" }))).issues.map((i) => i.id)).toEqual([modal.id]);

    await db().update(issues).set({ status: "accepted", assignment: "contributors" }).where(eq(issues.id, card.id));
    expect((await listIssues(parseFilters({ status: "contributors" }))).issues.map((i) => i.id)).toEqual([card.id]);
  });

  it("finds an issue by its GitHub number or its id, and nothing else", async () => {
    const ada = await makeUser("ada");
    const { id } = await submitNew(ada);
    await db().update(issues).set({ githubNumber: 42 }).where(eq(issues.id, id));
    expect((await getIssue("42"))?.id).toBe(id);
    expect((await getIssue(id))?.githubNumber).toBe(42);
    expect(await getIssue("43")).toBeNull();
    expect(await getIssue("../etc")).toBeNull();
  });
});

describe("comments and deleted accounts", () => {
  it("stores comments as written, within limits", async () => {
    const ada = await makeUser("ada");
    const { id } = await submitNew(ada);
    await addComment(id, ada, "  <b>not bold</b>  ");
    expect((await getIssue(id))?.comments.map((c) => c.body)).toEqual(["<b>not bold</b>"]);
    expect(await refusal(addComment(id, ada, "   "))).toBe(422);
    expect(await refusal(addComment(id, ada, "x".repeat(5001)))).toBe(422);
    expect(await refusal(addComment(randomUUID(), ada, "hello"))).toBe(404);
  });

  it("keeps a deleted user's reports and comments, unattributed", async () => {
    const ada = await makeUser("ada");
    const { id } = await submitNew(ada);
    await addComment(id, ada, "more detail");
    await db().delete(user).where(eq(user.id, ada));

    const issue = await getIssue(id);
    expect(issue?.reportCount).toBe(1);
    expect(issue?.reports[0].reporter).toBeNull();
    expect(issue?.comments[0]).toMatchObject({ body: "more detail", author: null });
    expect(issue?.events[0].actor).toBeNull();
  });
});
