import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { mountOverlay } from "../src/client/overlay.mjs";
import { SPEC } from "./helpers.mjs";

/* The overlay in a jsdom page. The bridge is stubbed at the two points the
   overlay talks to it: fetch (spec, info, route-files) and EventSource. */

const PAGE = `
  <main>
    <div data-astralis="Card" data-astralis-props='[{"variant":"outline","p":{"base":"2","md":"4"}}]'>
      <div data-astralis="Card.Body" data-astralis-props="[{}]"><span id="text">Hello</span></div>
    </div>
    <button id="trigger" data-astralis="Modal.Trigger Button" data-astralis-props='[{},{"variant":"ghost"}]'>Open</button>
    <div id="hostile" data-astralis="Box" data-astralis-props='[{"as":"&lt;img src=x onerror=alert(1)&gt;"}]'>x</div>
    <p id="plain">not a component</p>
  </main>`;

let dom;
let unmount;
let streams;
let requests;
let routeFiles;

class FakeEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.closed = false;
    streams.push(this);
  }
  addEventListener(type, listener) {
    (this.listeners[type] ??= []).push(listener);
  }
  emit(type, data) {
    for (const listener of this.listeners[type] ?? []) listener({ data: JSON.stringify(data) });
  }
  close() {
    this.closed = true;
  }
}

const tick = () => new Promise((done) => setTimeout(done, 0));

beforeEach(() => {
  dom = new JSDOM(`<!doctype html><html><body>${PAGE}</body></html>`, { url: "http://localhost:3000/about" });
  streams = [];
  requests = [];
  routeFiles = ["app/about/page.tsx", "app/layout.tsx"];
  const { window } = dom;
  Object.assign(globalThis, {
    window,
    document: window.document,
    location: window.location,
    Element: window.Element,
    EventSource: FakeEventSource,
    fetch: async (url) => {
      requests.push(url);
      const path = url.replace("/api/astralis-devtools/", "");
      const body = path === "spec"
        ? SPEC
        : path === "info"
          ? { library: { version: "0.7.8" } }
          : path.startsWith("route-files")
            ? { path: decodeURIComponent(path.split("=")[1]), files: routeFiles }
            : null;
      return { ok: body !== null, json: async () => body };
    },
  });
  unmount = mountOverlay({ framework: "next" });
});

afterEach(() => {
  unmount?.();
  dom.window.close();
});

const shadow = () => document.querySelector("astralis-devtools").shadowRoot;
const $ = (selector) => shadow().querySelector(selector);
const $$ = (selector) => [...shadow().querySelectorAll(selector)];
const button = (text) => $$("button").find((b) => b.textContent.includes(text));
const click = (element) => element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const move = (element) => element.dispatchEvent(new dom.window.MouseEvent("pointermove", { bubbles: true }));

const FINDINGS = {
  version: 2,
  files: 3,
  errors: 2,
  warnings: 1,
  results: [
    { file: "components/nav.tsx", errors: [{ code: "unknown-class", line: 4, column: 2, message: "no such class" }], warnings: [] },
    {
      file: "app/about/page.tsx",
      errors: [{ code: "invalid-recipe-value", line: 3, column: 16, message: 'Card: "glass" is not a variant value' }],
      warnings: [{ code: "paint-on-recipe", line: 7, column: 1, message: "paint on a recipe" }],
    },
  ],
};

test("mounts one launcher in a shadow root, once", () => {
  assert.equal(document.querySelectorAll("astralis-devtools").length, 1);
  assert.equal(mountOverlay()(), undefined, "a second mount is a no-op");
  assert.equal(document.querySelectorAll("astralis-devtools").length, 1);
  assert.equal($(".launcher").getAttribute("aria-expanded"), "false");
  assert.equal($(".panel").hidden, true);
  assert.equal(streams[0].url, "/api/astralis-devtools/events");
});

test("the badge counts errors, and the Findings tab puts this page's files first", async () => {
  streams[0].emit("findings", FINDINGS);
  assert.equal($(".badge").hidden, false);
  assert.equal($(".badge").textContent, "2");
  assert.match($(".launcher").getAttribute("aria-label"), /2 errors, 1 warning/);

  click($(".launcher"));
  click(button("Findings"));
  await tick();
  const text = $(".body").textContent;
  assert.match(text, /2 errors, 1 warning in 3 files · astralis-ui 0\.7\.8/);
  const titles = $$(".group-title").map((t) => t.textContent);
  assert.deepEqual(titles, ["This page", "Elsewhere in the project"]);
  assert.deepEqual($$(".file-name").map((f) => f.textContent), ["app/about/page.tsx", "components/nav.tsx"]);
  assert.deepEqual($$(".file")[0].querySelectorAll(".at").length, 2, "error and warning, by line");
  assert.ok(requests.includes("/api/astralis-devtools/route-files?path=%2Fabout"));
});

test("a clean project and a clean page say so", async () => {
  streams[0].emit("findings", { version: 1, files: 4, errors: 0, warnings: 0, results: [] });
  click($(".launcher"));
  click(button("Findings"));
  await tick();
  assert.equal($(".badge").hidden, true);
  assert.match($(".body").textContent, /No findings in the 2 files that render this page/);
  assert.match($(".body").textContent, /Every file conforms/);
});

test("route files follow client-side navigation", async (t) => {
  // Unmount before mocking, so the real interval is cleared by the real clearInterval.
  unmount();
  t.mock.timers.enable({ apis: ["setInterval"] });
  unmount = mountOverlay({ framework: "next" });
  streams.at(-1).emit("findings", { version: 1, files: 4, errors: 0, warnings: 0, results: [] });
  routeFiles = ["app/pricing/page.tsx"];
  dom.window.history.pushState({}, "", "/pricing");
  t.mock.timers.tick(1000);
  await tick();
  click($(".launcher"));
  click(button("Findings"));
  assert.ok(requests.includes("/api/astralis-devtools/route-files?path=%2Fpricing"));
  assert.match($(".body").textContent, /No findings in the file that renders this page/);
});

test("when the bridge does not answer, the Next.js route to add is shown", () => {
  streams[0].emit("error", {});
  click($(".launcher"));
  click(button("Findings"));
  assert.match($(".body").textContent, /app\/api\/astralis-devtools\/\[\.\.\.path\]\/route\.ts/);
  assert.match($(".body").textContent, /astralis init --devtools/);
});

test("picking a component shows its name, props, client tier, docs and ancestors, and the page never sees the click", async () => {
  await tick();
  let pageClicks = 0;
  document.addEventListener("click", () => pageClicks++);
  click($(".launcher"));
  click(button("Pick a component"));
  assert.equal(button("Picking").getAttribute("aria-pressed"), "true");

  const text = document.getElementById("text");
  move(text);
  assert.equal($(".highlight").hidden, false);
  assert.equal($(".highlight .label").textContent, "Card.Body");

  click(text);
  assert.equal(pageClicks, 0, "the picking click is swallowed");
  assert.equal($(".component h3").textContent, "Card.Body");
  assert.match($(".body").textContent, /Server Component/);
  assert.equal($(".link").getAttribute("href"), "https://astralis-zeta.vercel.app/docs/components/card");
  assert.match($(".body").textContent, /No props beyond its defaults/);

  click($$(".crumb").find((c) => c.textContent === "Card"));
  assert.equal($(".component h3").textContent, "Card");
  const rows = $$("tr").map((r) => r.textContent);
  assert.deepEqual(rows, ['variant"outline"', 'p{"base":"2","md":"4"}']);

  click(document.getElementById("plain"));
  assert.equal(pageClicks, 1, "clicks reach the page again once picking stops");

  assert.equal($(".highlight").hidden, false, "the selection stays outlined on the Inspect tab");
  click(button("Findings"));
  assert.equal($(".highlight").hidden, true, "but not behind another tab");
  click(button("Inspect"));
  assert.equal($(".highlight").hidden, false);
  click($(".close"));
  assert.equal($(".highlight").hidden, true, "nor once the panel is closed");
});

test("an element two components render onto shows the whole chain", async () => {
  await tick();
  click($(".launcher"));
  click(button("Pick a component"));
  click(document.getElementById("trigger"));
  assert.equal($(".component h3").textContent, "Modal.Trigger");
  assert.match($(".chain").textContent, /renders through Button/);
  assert.equal($$(".section h4").some((h4) => h4.textContent === "Button"), true);
  assert.deepEqual($$("tr").map((r) => r.textContent), ['variant"ghost"']);
});

test("Escape stops picking", () => {
  click($(".launcher"));
  click(button("Pick a component"));
  document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(button("Pick a component").getAttribute("aria-pressed"), "false");
});

test("page data is shown as text, never parsed as markup", () => {
  click($(".launcher"));
  click(button("Pick a component"));
  click(document.getElementById("hostile"));
  assert.equal($$("img").length, 0);
  assert.match($(".body").textContent, /<img src=x onerror=alert\(1\)>/);
});

test("unmounting removes the overlay and everything it listened to", () => {
  click($(".launcher"));
  click(button("Pick a component"));
  unmount();
  unmount = null;
  assert.equal(document.querySelector("astralis-devtools"), null);
  assert.equal(streams[0].closed, true);
  let pageClicks = 0;
  document.addEventListener("click", () => pageClicks++);
  click(document.getElementById("plain"));
  assert.equal(pageClicks, 1, "no picking listener left behind");
});
