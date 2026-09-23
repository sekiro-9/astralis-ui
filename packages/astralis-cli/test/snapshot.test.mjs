import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  SNAPSHOT_FORMAT,
  MAX_SNAPSHOT_BYTES,
  checkSnapshot,
  cleanConsoleMessage,
  cleanRoute,
  contentOf,
  describedProps,
  narrowProps,
  narrowTree,
  submitDraft,
  toRepro,
} from "astralis-cli/snapshot";
import { prepareSpec, validateSource } from "astralis-cli/validate";

const SPEC = JSON.parse(readFileSync(fileURLToPath(import.meta.resolve("astralis-ui/system-spec.json")), "utf8"));
const PREPARED = prepareSpec(SPEC);

/** A valid snapshot with `overrides` applied. */
function snapshot(overrides = {}) {
  return {
    format: SNAPSHOT_FORMAT,
    source: "devtools",
    library: { name: "astralis-ui", version: "0.7.8", specVersion: 3, specSha256: "a".repeat(64) },
    environment: { framework: { name: "next", version: "16.3.3" }, react: "19.2.8", browser: "Chrome 140", viewport: { width: 1280, height: 800 }, colorMode: "dark" },
    route: "/about",
    tree: [
      {
        component: "Card",
        props: { variant: "outline" },
        client: "none",
        children: [{ component: "Card.Body", props: {}, client: "none", children: [{ redacted: true, length: 5 }] }],
      },
    ],
    findings: [{ code: "invalid-recipe-value", file: "app/page.tsx", line: 3, column: 16, message: "x" }],
    description: { title: "Card loses its border", happened: "No border.", expected: "A border." },
    ...overrides,
  };
}

test("describedProps: recipe, scalar and group props, less what the type omits", () => {
  const button = describedProps(SPEC, "Button");
  for (const prop of ["variant", "colorScheme", "disabled", "loading"]) assert.ok(button.has(prop), prop);
  assert.ok(describedProps(SPEC, "Box").has("hover"), "box takes the interaction states");
  assert.equal(describedProps(SPEC, "Heading").has("paragraph"), false, "Heading's type omits paragraph");
  assert.ok(describedProps(SPEC, "Image").has("width"), "Image's own width attribute");
  assert.ok(describedProps(SPEC, "Card.Body"), "a dotted part resolves");
  assert.equal(describedProps(SPEC, "Nope"), null);
});

test("narrowProps keeps configuration and drops content, handlers and anything undescribed", () => {
  assert.deepEqual(
    narrowProps(SPEC, "Image", { src: "/me.png", alt: "me", objectFit: "cover", width: 140, onLoad: "x", foo: "bar" }),
    { objectFit: "cover", width: 140 },
  );
  assert.deepEqual(
    narrowProps(SPEC, "Box", { p: { base: "2", md: "4" }, hover: { bg: "gray.100" }, as: "section", "data-x": "1" }),
    { p: { base: "2", md: "4" }, hover: { bg: "gray.100" } },
  );
  assert.deepEqual(narrowProps(SPEC, "Button", { variant: "x".repeat(65), size: "sm" }), { size: "sm" });
  assert.deepEqual(narrowProps(SPEC, "Nope", { variant: "outline" }), {});
});

test("contentOf reads a part as its root uses it", () => {
  assert.equal(contentOf(SPEC, "Modal.Trigger"), "element");
  assert.equal(contentOf(SPEC, "Button"), "text");
  assert.equal(contentOf(SPEC, "Nope"), null);
});

test("checkSnapshot accepts a well-formed snapshot", () => {
  assert.deepEqual(checkSnapshot(snapshot()), []);
  assert.deepEqual(checkSnapshot(snapshot({ findings: undefined, route: null })), []);
});

test("checkSnapshot rejects what the reporter was not shown by name, and what could leak", () => {
  const cases = [
    [{ extra: 1 }, /unknown field "extra"/],
    [{ format: "v2" }, /format must be/],
    [{ source: "web" }, /source must be/],
    [{ route: "/a?token=1" }, /route must be a path/],
    [{ description: { title: " " } }, /title is required/],
    [{ description: { title: "t", secret: "x" } }, /unknown field "secret"/],
    [{ findings: [{ code: "x", file: "C:\\Users\\me\\app\\page.tsx", line: 1, column: 1, message: "m" }] }, /project-relative/],
    [{ findings: [{ code: "x", file: "../secret.tsx", line: 1, column: 1, message: "m" }] }, /project-relative/],
    [{ findings: [{ code: "x", file: "/etc/passwd", line: 1, column: 1, message: "m" }] }, /project-relative/],
    [{ screenshot: "https://example.com/a.png" }, /data URL/],
    [{ tree: [] }, /at least one component/],
    [{ tree: [{ redacted: true, length: 2 }] }, /start at components/],
    [{ tree: [{ component: "card", props: {} }] }, /component name/],
    [{ tree: [{ component: "Card", props: {}, html: "<b>" }] }, /unknown field "html"/],
    [{ tree: [{ component: "Box", props: {}, children: [{ text: "x".repeat(201) }] }] }, /not a text node/],
    [{ console: Array(21).fill("e") }, /at most 20/],
    [{ library: { name: "other", version: "1", specVersion: 3, specSha256: "a".repeat(64) } }, /library must/],
  ];
  for (const [overrides, pattern] of cases) {
    const problems = checkSnapshot(snapshot(overrides));
    assert.ok(problems.some((p) => pattern.test(p)), `${JSON.stringify(overrides).slice(0, 60)}: ${problems.join("; ")}`);
  }
});

test("checkSnapshot enforces the size and node limits", () => {
  const big = snapshot({ screenshot: `data:image/jpeg;base64,${"A".repeat(MAX_SNAPSHOT_BYTES)}` });
  assert.ok(checkSnapshot(big).some((p) => /the limit is 256 kB/.test(p)));
  const many = snapshot({ tree: Array.from({ length: 301 }, () => ({ component: "Box", props: {} })) });
  assert.ok(checkSnapshot(many).some((p) => /more than 300 nodes/.test(p)));
});

test("toRepro writes a file that parses, validates, and reproduces the snapshot's finding", () => {
  const source = toRepro(snapshot({ tree: [{ component: "Card", props: { variant: "glass" }, children: [{ component: "Card.Body", props: {}, children: [{ redacted: true, length: 4 }] }] }] }));
  assert.match(source, /^import \{ Card \} from "astralis-ui";$/m);
  assert.match(source, /<Card variant="glass">\n\s+<Card\.Body>\n\s+Text\n\s+<\/Card\.Body>/);
  const { errors } = validateSource(source, PREPARED, "repro.tsx");
  assert.deepEqual(errors.map((e) => e.code), ["invalid-recipe-value"]);

  const clean = toRepro(snapshot());
  assert.deepEqual(validateSource(clean, PREPARED, "repro.tsx").errors, []);
});

test("toRepro writes values of every kind as valid JSX", () => {
  const source = toRepro(snapshot({
    tree: [{
      component: "Box",
      props: { p: { base: "2", md: "4" }, hover: { bg: "gray.100" } },
      renders: ["Inner"],
      children: [{ text: 'a {b} <c> "d"' }, { component: "Button", props: { disabled: true, size: "sm" } }],
    }],
  }));
  assert.match(source, /<Box p=\{\{ base: "2", md: "4" \}\} hover=\{\{ bg: "gray\.100" \}\}>/);
  assert.match(source, /\{\/\* renders through Inner \*\/\}/);
  assert.match(source, /a \{"\{"\}b\{"\}"\} \{"<"\}c\{">"\} "d"/);
  assert.match(source, /<Button disabled size="sm" \/>/);
  assert.deepEqual(validateSource(source, PREPARED, "repro.tsx").errors, []);
});

test("routes and console messages are cleaned before they can leave", () => {
  assert.equal(cleanRoute("/a/b?x=1#top"), "/a/b");
  assert.equal(cleanRoute(null), null);
  assert.equal(
    cleanConsoleMessage("Error at http://localhost:3000/_next/app.js and C:\\Users\\paula\\proj\\src\\page.tsx:4", "http://localhost:3000"),
    "Error at /_next/app.js and src/page.tsx:4",
  );
  assert.equal(cleanConsoleMessage("at /home/sam/work/app/components/nav.tsx:9"), "at app/components/nav.tsx:9");
  assert.equal(cleanConsoleMessage("x".repeat(600)).length, 500);
});

test("submitDraft posts the snapshot and returns the draft's address", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ id: "d1", url: "/issues/new?draft=d1" }), { status: 201 });
  };
  const url = await submitDraft(snapshot(), { origin: "https://issues.example", fetchImpl });
  assert.equal(url, "https://issues.example/issues/new?draft=d1");
  assert.equal(calls[0].url, "https://issues.example/api/issues/drafts");
  assert.equal(calls[0].init.headers["content-type"], "application/json");
  assert.deepEqual(JSON.parse(calls[0].init.body), snapshot());
});

test("submitDraft explains each way sending can fail, and never sends an invalid snapshot", async () => {
  let called = false;
  await assert.rejects(submitDraft(snapshot({ format: "x" }), { fetchImpl: async () => (called = true) }), /not valid/);
  assert.equal(called, false);
  await assert.rejects(
    submitDraft(snapshot(), { origin: "https://down.example", fetchImpl: async () => { throw new TypeError("fetch failed"); } }),
    /Could not reach the Astralis issue platform at https:\/\/down\.example \(fetch failed\)/,
  );
  await assert.rejects(
    submitDraft(snapshot(), { fetchImpl: async () => new Response(JSON.stringify({ error: "too large" }), { status: 413 }) }),
    /did not accept the draft: too large/,
  );
  await assert.rejects(submitDraft(snapshot(), { fetchImpl: async () => new Response("{}", { status: 201 }) }), /returned no address/);
});

test("narrowTree narrows every component, whatever built the tree", () => {
  const tree = narrowTree(SPEC, [
    { component: "Card", props: { variant: "outline", href: "/x" }, client: "required", children: [
      { component: "Image", props: { src: "/me.png", objectFit: "cover" }, renders: ["Img"] },
      { text: "kept as given" },
    ] },
  ]);
  assert.deepEqual(tree, [
    { component: "Card", props: { variant: "outline" }, client: "none", children: [
      { component: "Image", props: { objectFit: "cover" }, client: "required", renders: ["Img"], children: [] },
      { text: "kept as given" },
    ] },
  ]);
  assert.deepEqual(narrowTree(SPEC, "nope"), []);
});
