import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { findingsFor, findingsForGroup, flatFindings, groupByComponent, instanceLabel, scanPage } from "../src/client/page.mjs";

/* The page model: which components are on the page, and which findings are
   about them. */

const { document } = new JSDOM(`<!doctype html><body>
  <button data-astralis="Button" data-astralis-props='[{"variant":"primary"}]'>Save</button>
  <button data-astralis="Button" data-astralis-props='[{"variant":"solid"}]'>Cancel</button>
  <img data-astralis="Image" data-astralis-props="[{}]">
  <div id="own"><span data-astralis="Text" data-astralis-props="[{}]">mine</span></div>
</body>`).window;

const FINDINGS = {
  files: 3,
  errors: 3,
  warnings: 1,
  results: [
    {
      file: "app/page.tsx",
      errors: [
        { code: "invalid-recipe-value", line: 4, column: 3, message: "m", component: "Button", prop: "variant", value: "primary" },
        { code: "missing-alt", line: 6, column: 3, message: "m", component: "Image" },
      ],
      warnings: [{ code: "paint-on-recipe", line: 5, column: 3, message: "m", component: "Button", prop: "bg", value: "red" }],
    },
    { file: "components/other.tsx", errors: [{ code: "invalid-recipe-value", line: 1, column: 1, message: "m", component: "Button", prop: "variant", value: "ghost2" }], warnings: [] },
  ],
};

const instances = scanPage(document, document.getElementById("own"));
const [save, cancel, image] = instances;

test("the page's components, in order, without the overlay's own", () => {
  assert.deepEqual(instances.map((i) => i.name), ["Button", "Button", "Image"]);
  assert.deepEqual(groupByComponent(instances).map((g) => [g.name, g.instances.length]), [["Button", 2], ["Image", 1]]);
  assert.deepEqual(instanceLabel(save), { text: "Save", props: 'variant="primary"' });
});

test("a finding is exact for the instance given that very value", () => {
  const onSave = findingsFor(save, FINDINGS, { routeFiles: ["app/page.tsx"] });
  assert.deepEqual(onSave.map((f) => [f.value, f.exact, f.onPage]), [
    ["primary", true, true],
    ["red", false, true],
    ["ghost2", false, false],
  ]);
  assert.equal(findingsFor(cancel, FINDINGS, { routeFiles: ["app/page.tsx"] }).some((f) => f.exact), false);
});

test("a finding with no value is exact when the component is alone on the page and the finding is in the page's files", () => {
  assert.equal(findingsFor(image, FINDINGS, { routeFiles: ["app/page.tsx"], alone: true })[0].exact, true);
  assert.equal(findingsFor(image, FINDINGS, { routeFiles: [], alone: true })[0].exact, false);
});

test("a group counts what is likely on it: exact, or in the page's files", () => {
  const [buttons] = groupByComponent(instances);
  assert.deepEqual(findingsForGroup(buttons, FINDINGS, ["app/page.tsx"]), { errors: 1, warnings: 1 });
  assert.deepEqual(findingsForGroup(buttons, FINDINGS, []), { errors: 1, warnings: 0 }, "only the exact one, without route files");
  assert.equal(flatFindings(FINDINGS, ["components/other.tsx"]).length, 1);
});
