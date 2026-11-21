import { test } from "node:test";
import assert from "node:assert/strict";
import { filterProps, propsModel } from "../src/client/props.mjs";
import { SPEC } from "./helpers.mjs";

/* The list of every prop a component takes, built from a spec entry, and its
   search. A small spec states each rule exactly; the real one proves the
   shapes it ships are read. */

const keyword = (tokens) => ({ kind: "keyword", tokens, arbitrary: false });
const channel = (tokens, valueType, extra = {}) => ({ kind: "channel", slug: "x", tokens, arbitrary: true, valueType, ...extra });

const MINI = {
  propGroups: {
    box: {
      p: channel(["0", "1", "2", "3", "4"], "length", { long: "padding" }),
      padding: channel(["0", "1", "2", "3", "4"], "length", { short: "p" }),
      bg: channel(["base", "muted", "red-500"], "color"),
      display: keyword(["block", "flex", "grid"]),
      w: channel(["full", "auto"], "length"),
    },
    placement: {
      w: channel(["full", "auto"], "length"),
      m: channel(["0", "1", "auto"], "length", { long: "margin" }),
      margin: channel(["0", "1", "auto"], "length", { short: "m" }),
      width: channel(["full", "auto"], "length"),
    },
  },
  components: {
    Panel: {
      groups: ["box", "placement"],
      props: { variant: ["outline", "filled"], size: ["sm", "md", "lg"] },
      scalarProps: { open: "boolean", label: "string" },
      required: { label: "string" },
      exclude: ["display"],
      overrides: ["width"],
      ownStyleProps: ["color"],
      propDocs: {
        variant: { description: "How the panel is drawn.", default: "outline" },
        size: { description: 42, default: "" },
        open: "not an object",
      },
      parts: ["Body"],
      partExports: { Body: "PanelBody" },
    },
    PanelBody: { groups: [], ownStyleProps: ["p", "padding", "bg", "display", "w", "color"] },
  },
};

const rowsOf = (model, id) => model.sections.find((s) => s.id === id)?.rows ?? [];
const names = (rows) => rows.map((r) => r.name);

test("own props come first, required ones leading, with their values or their type", () => {
  const model = propsModel(MINI, "Panel");
  assert.equal(model.key, "Panel");
  assert.deepEqual(model.sections.map((s) => s.id), ["own", "group:box", "group:placement"]);
  const own = rowsOf(model, "own");
  assert.deepEqual(names(own), ["label", "variant", "size", "open", "width", "color"]);
  const by = Object.fromEntries(own.map((r) => [r.name, r]));
  assert.deepEqual(by.label, { name: "label", aliases: [], values: [], type: "string", arbitrary: null, required: true, used: null });
  assert.deepEqual(by.variant.values, ["outline", "filled"]);
  assert.equal(by.open.type, "boolean");
  assert.equal(by.open.required, false);
  assert.equal(by.width.note, "Its own attribute, not the style prop", "an override is the component's, not the group's");
  assert.equal(by.color.note, "Values not in the spec");
  assert.equal(model.total, own.length + rowsOf(model, "group:box").length + rowsOf(model, "group:placement").length);
});

test("style props come by group: excluded ones left out, long spellings folded in, each prop shown once", () => {
  const model = propsModel(MINI, "Panel");
  const box = rowsOf(model, "group:box");
  assert.deepEqual(names(box), ["p", "bg", "w"], "display is excluded; padding is p's long spelling");
  assert.deepEqual(box[0].aliases, ["padding"]);
  assert.equal(box[0].arbitrary, "length");
  assert.equal(box[1].arbitrary, "color");
  const placement = rowsOf(model, "group:placement");
  assert.deepEqual(names(placement), ["m"], "w is already listed under Box, width is the component's own");
  assert.deepEqual(placement[0].aliases, ["margin"]);
  assert.equal(model.sections[1].label, "Box");
  assert.match(model.sections[2].hint, /margin/);
});

test("the props this instance uses are marked with their value, under either spelling", () => {
  const model = propsModel(MINI, "Panel", { variant: "filled", margin: "auto", p: { base: "2", md: "4" }, as: "section" });
  const all = model.sections.flatMap((s) => s.rows);
  const used = Object.fromEntries(all.filter((r) => r.used).map((r) => [r.name, r.used]));
  assert.deepEqual(used, {
    variant: { as: "variant", value: "filled" },
    m: { as: "margin", value: "auto" },
    p: { as: "p", value: { base: "2", md: "4" } },
  });
});

test("descriptions and defaults are read when the spec has them, and ignored when they are not text", () => {
  const own = rowsOf(propsModel(MINI, "Panel"), "own");
  const by = Object.fromEntries(own.map((r) => [r.name, r]));
  assert.equal(by.variant.description, "How the panel is drawn.");
  assert.equal(by.variant.default, "outline");
  assert.equal("description" in by.size, false);
  assert.equal("default" in by.size, false);
  assert.equal("description" in by.open, false);
  assert.equal("description" in by.label, false, "no propDocs entry: no description");
});

test("a part resolves to its own entry, and style props the spec lists by name are shown as their group", () => {
  const model = propsModel(MINI, "Panel.Body");
  assert.equal(model.key, "PanelBody");
  const box = model.sections.find((s) => s.id === "group:box");
  assert.equal(box.inferred, true);
  assert.deepEqual(names(box.rows), ["p", "bg", "display", "w"]);
  assert.deepEqual(names(rowsOf(model, "own")), ["color"], "the rest stays its own, values unknown");
  assert.equal(propsModel(MINI, "Nope"), null);
  assert.equal(propsModel(null, "Panel"), null);
});

test("the search finds a prop by name or long spelling, or by a value it takes", () => {
  const model = propsModel(MINI, "Panel");
  assert.equal(filterProps(model, "").count, model.total);
  assert.equal(filterProps(model, "   ").sections, model.sections);

  const byName = filterProps(model, "VAR");
  assert.deepEqual(byName.sections.flatMap((s) => names(s.rows)), ["variant"]);
  assert.equal(byName.sections[0].rows[0].byValue, undefined);

  const byAlias = filterProps(model, "margin");
  assert.deepEqual(byAlias.sections.map((s) => s.id), ["group:placement"]);

  const byValue = filterProps(model, "red-5");
  assert.deepEqual(byValue.sections.flatMap((s) => s.rows.map((r) => [r.name, r.byValue])), [["bg", true]]);
  assert.deepEqual(filterProps(model, "boolean").sections.flatMap((s) => names(s.rows)), ["open"], "a type is found by its exact name");

  assert.deepEqual(filterProps(model, "zzz"), { sections: [], count: 0 });
  assert.deepEqual(filterProps(null, "x"), { sections: [], count: 0 });
});

test("the shipped spec: Card, Heading, Box and a part", () => {
  const card = propsModel(SPEC, "Card", { variant: "outline" });
  assert.deepEqual(card.sections.map((s) => s.id), ["own", "group:placement"]);
  const variant = rowsOf(card, "own").find((r) => r.name === "variant");
  assert.deepEqual(variant.values, SPEC.components.Card.props.variant);
  assert.deepEqual(variant.used, { as: "variant", value: "outline" });

  const heading = propsModel(SPEC, "Heading");
  const listed = heading.sections.flatMap((s) => s.rows.flatMap((r) => [r.name, ...r.aliases]));
  assert.ok(!listed.includes("paragraph"), "Heading excludes paragraph");
  assert.ok(listed.includes("weight"));

  // Box's own group, with every name the spec gives it, each listed once.
  const box = propsModel(SPEC, "Box");
  const boxNames = box.sections.flatMap((s) => s.rows.flatMap((r) => [r.name, ...r.aliases]));
  assert.equal(new Set(boxNames).size, boxNames.length);
  for (const prop of Object.keys(SPEC.propGroups.box)) assert.ok(boxNames.includes(prop), prop);
  assert.ok(box.total > 50 && box.total < Object.keys(SPEC.propGroups.box).length, "long spellings are folded");

  assert.equal(propsModel(SPEC, "Card.Body").key, "CardBody");
});
