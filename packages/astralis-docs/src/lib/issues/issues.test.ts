import { describe, expect, it } from "vitest";
import { MAX_SNAPSHOT_BYTES } from "astralis-cli/snapshot";

import { readDraftRequest } from "./draft-request";
import { filtersHref, parseFilters } from "./filters";
import { fingerprintOf, minorVersion } from "./fingerprint";
import { sampleSnapshot } from "./fixtures";

const post = (body: BodyInit | null, headers: Record<string, string> = { "content-type": "application/json" }) =>
  new Request("http://localhost/api/issues/drafts", { method: "POST", body, headers });

describe("fingerprint", () => {
  it("is the component, the rule codes and the minor version", () => {
    const print = fingerprintOf(sampleSnapshot());
    expect(print.component).toBe("Card");
    expect(print.ruleCodes).toEqual(["invalid-recipe-value"]);
    expect(print.minor).toBe("0.7");
    expect(print.value).toMatch(/^[0-9a-f]{64}$/);
  });

  it("ignores what differs between two people meeting the same problem", () => {
    const a = sampleSnapshot();
    const b = sampleSnapshot({
      route: "/pricing",
      library: { ...a.library, version: "0.7.9" },
      description: { title: "Glass card is flat" },
      tree: [{ component: "Card", props: { variant: "glass" }, children: [] }],
      findings: [
        { ...a.findings![0], file: "src/pricing.tsx", line: 40 },
        { ...a.findings![0], file: "src/other.tsx" },
      ],
    });
    expect(fingerprintOf(b).value).toBe(fingerprintOf(a).value);
  });

  it("changes with the component, the rules or the minor version", () => {
    const base = fingerprintOf(sampleSnapshot()).value;
    const s = sampleSnapshot();
    expect(fingerprintOf({ ...s, tree: [{ component: "Button", props: {}, children: [] }] }).value).not.toBe(base);
    expect(fingerprintOf({ ...s, findings: [] }).value).not.toBe(base);
    expect(fingerprintOf({ ...s, library: { ...s.library, version: "0.8.0" } }).value).not.toBe(base);
  });

  it("orders rule codes, so the order findings arrive in does not matter", () => {
    const s = sampleSnapshot();
    const f = (code: string) => ({ ...s.findings![0], code });
    const one = fingerprintOf({ ...s, findings: [f("b-rule"), f("a-rule")] });
    const two = fingerprintOf({ ...s, findings: [f("a-rule"), f("b-rule"), f("a-rule")] });
    expect(one.value).toBe(two.value);
    expect(one.ruleCodes).toEqual(["a-rule", "b-rule"]);
  });

  it("reads the minor version of prereleases and keeps odd versions whole", () => {
    expect(minorVersion("1.2.3-beta.4")).toBe("1.2");
    expect(minorVersion("next")).toBe("next");
  });
});

describe("draft request", () => {
  it("accepts a valid snapshot", async () => {
    const result = await readDraftRequest(post(JSON.stringify(sampleSnapshot())));
    expect(result).toMatchObject({ ok: true, snapshot: { description: { title: "Card loses its border with variant glass" } } });
  });

  it("refuses anything but JSON", async () => {
    expect(await readDraftRequest(post("x", { "content-type": "text/plain" }))).toMatchObject({ ok: false, status: 415 });
    expect(await readDraftRequest(post("{not json"))).toMatchObject({ ok: false, status: 400 });
  });

  it("refuses a body over the size limit, declared or not", async () => {
    const big = JSON.stringify({ ...sampleSnapshot(), screenshot: `data:image/png;base64,${"A".repeat(MAX_SNAPSHOT_BYTES)}` });
    expect(await readDraftRequest(post(big))).toMatchObject({ ok: false, status: 413 });
    // A stream carries no content-length: the limit is enforced while reading.
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(big));
        controller.close();
      },
    });
    const undeclared = new Request("http://localhost/", {
      method: "POST",
      body: stream,
      headers: { "content-type": "application/json" },
      duplex: "half",
    } as RequestInit);
    expect(await readDraftRequest(undeclared)).toMatchObject({ ok: false, status: 413 });
  });

  it("refuses a snapshot the schema rejects, and says why", async () => {
    const extra = { ...sampleSnapshot(), cookies: "session=abc" };
    const result = await readDraftRequest(post(JSON.stringify(extra)));
    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(!result.ok && result.error).toContain('unknown field "cookies"');
    const absolute = sampleSnapshot({ findings: [{ ...sampleSnapshot().findings![0], file: "C:/Users/me/app/page.tsx" }] });
    expect(await readDraftRequest(post(JSON.stringify(absolute)))).toMatchObject({ ok: false, status: 422 });
  });
});

describe("list filters", () => {
  it("default to open issues and drop what they do not recognise", () => {
    expect(parseFilters({})).toEqual({ status: "open", component: null, rule: null, severity: null });
    expect(parseFilters({ status: "bogus", component: "<script>", severity: "urgent" })).toEqual({
      status: "open",
      component: null,
      rule: null,
      severity: null,
    });
  });

  it("round-trip through the URL, leaving the defaults out", () => {
    const filters = parseFilters({ status: "contributors", component: "Card.Body", rule: "invalid-recipe-value", severity: "high" });
    expect(filtersHref(filters)).toBe("/issues?status=contributors&component=Card.Body&rule=invalid-recipe-value&severity=high");
    expect(parseFilters(Object.fromEntries(new URL(filtersHref(filters), "http://x").searchParams))).toEqual(filters);
    expect(filtersHref(parseFilters({}))).toBe("/issues");
    expect(filtersHref(parseFilters({}), 2)).toBe("/issues?page=2");
  });

  it("take the first of repeated parameters", () => {
    expect(parseFilters({ status: ["fixed", "new"] }).status).toBe("fixed");
  });
});

describe("formatting", () => {
  it("writes dates the same on every server, in UTC", async () => {
    const { formatDate } = await import("./format");
    expect(formatDate(new Date("2026-09-26T23:30:00Z"))).toBe("26 Sep 2026");
    expect(formatDate(new Date("2026-01-01T00:00:00Z"))).toBe("1 Jan 2026");
  });

  it("only sends people back to issue pages on this site", async () => {
    const { safeReturnPath } = await import("./format");
    expect(safeReturnPath("/issues/new?draft=abc")).toBe("/issues/new?draft=abc");
    expect(safeReturnPath("https://evil.test/issues")).toBe("/issues");
    expect(safeReturnPath("//evil.test/issues")).toBe("/issues");
    expect(safeReturnPath(String.raw`/issues\@evil.test`)).toBe("/issues");
    expect(safeReturnPath("/docs")).toBe("/issues");
  });
});
