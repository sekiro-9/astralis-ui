import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describeComponent, docsPath, documentedRoot, readIdentity, specEntry } from "../src/client/identity.mjs";
import { SPEC } from "./helpers.mjs";

const element = (attributes) => ({ getAttribute: (name) => attributes[name] ?? null });

test("readIdentity pairs each name in the chain with its props, outermost first", () => {
  const chain = readIdentity(
    element({ "data-astralis": "Modal.Trigger Button", "data-astralis-props": '[{},{"variant":"ghost"}]' }),
  );
  assert.deepEqual(chain, [
    { name: "Modal.Trigger", props: {} },
    { name: "Button", props: { variant: "ghost" } },
  ]);
});

test("readIdentity keeps the names when the props attribute is missing, malformed or mismatched", () => {
  const expected = [
    { name: "Card", props: {} },
    { name: "Box", props: {} },
  ];
  assert.deepEqual(readIdentity(element({ "data-astralis": "Card Box" })), expected);
  assert.deepEqual(readIdentity(element({ "data-astralis": "Card Box", "data-astralis-props": "{nope" })), expected);
  assert.deepEqual(readIdentity(element({ "data-astralis": "Card Box", "data-astralis-props": "[{}]" })), expected);
  assert.deepEqual(readIdentity(element({})), []);
});

test("specEntry finds roots, dotted parts, and a root's own Root part", () => {
  assert.equal(specEntry(SPEC, "Card")?.key, "Card");
  assert.equal(specEntry(SPEC, "Card.Body")?.key, "CardBody");
  assert.equal(specEntry(SPEC, "Card.Root")?.key, "Card");
  assert.equal(specEntry(SPEC, "Nope"), null);
  assert.equal(specEntry(SPEC, "Card.Nope"), null);
});

test("every part the spec lists resolves from its dotted name", () => {
  for (const [root, entry] of Object.entries(SPEC.components)) {
    for (const [part, flat] of Object.entries(entry.partExports ?? {})) {
      assert.equal(specEntry(SPEC, `${root}.${part}`)?.key, flat, `${root}.${part}`);
    }
  }
});

test("a part is documented under the root that lists it", () => {
  assert.equal(documentedRoot(SPEC, "Card.Body"), "Card");
  assert.equal(documentedRoot(SPEC, "CardBody"), "Card");
  assert.equal(documentedRoot(SPEC, "Button"), "Button");
});

test("describeComponent reports the client tier and the docs page", () => {
  const card = describeComponent(SPEC, "Card");
  assert.equal(card.known, true);
  assert.equal(card.client, "none");
  assert.equal(card.clientLabel, "Server Component");
  assert.equal(card.docsUrl, "https://astralis-ui.com/docs/components/card");
  assert.equal(describeComponent(SPEC, "Modal.Trigger").docsUrl, "https://astralis-ui.com/docs/components/modal");
  assert.equal(describeComponent(null, "Card").client, null, "works before the spec arrives");
});

test("the client tier is explained for the app it is shown in", () => {
  assert.match(describeComponent(SPEC, "Card", "next").clientDetail, /^Renders on the server/);
  const inVite = describeComponent(SPEC, "Card", "vite");
  assert.equal(inVite.clientLabel, "Server Component", "the label is a fact about the component");
  assert.match(inVite.clientDetail, /This app renders it in the browser/);
});

/*
 * Every name astralis-ui can put on the page (the identify("…") calls in its
 * source) is either in the spec or a part of a root that is, so the Inspect
 * panel never meets a name it cannot place. Monorepo check.
 */
test("every name the library emits resolves in the spec, directly or through its root", () => {
  const source = fileURLToPath(new URL("../../astralis-ui/src/components", import.meta.url));
  const names = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry.name)) for (const m of readFileSync(path, "utf8").matchAll(/identify\("([^"]+)"/g)) names.add(m[1]);
    }
  };
  walk(source);
  assert.ok(names.size > 200, `found the identify() calls (${names.size})`);
  const unplaced = [...names].filter((name) => {
    const about = describeComponent(SPEC, name);
    return !about.known && !about.partOf;
  });
  assert.deepEqual(unplaced, []);
});

/*
 * The docs link must land on a real page for every component the spec knows.
 * Pages are folders in astralis-docs (monorepo check, like the CI guide test).
 */
test("every component's docs link points at a page the docs site has", () => {
  const docs = fileURLToPath(new URL("../../astralis-docs/src/app", import.meta.url));
  const exists = (path) => statSync(`${docs}${path}`, { throwIfNoEntry: false })?.isDirectory() ?? false;
  const pages = new Set(readdirSync(`${docs}/docs/components`));
  assert.ok(pages.has("card"), "found the docs pages");
  const broken = Object.keys(SPEC.components)
    .map((name) => [name, docsPath(documentedRoot(SPEC, name))])
    .filter(([, path]) => !exists(path));
  assert.deepEqual(broken, []);
});
