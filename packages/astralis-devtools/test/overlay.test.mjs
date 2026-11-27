import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { mountOverlay } from "../src/client/overlay.mjs";
import { SPEC } from "./helpers.mjs";

/* The overlay in a jsdom page. The bridge is stubbed at the two points the
   overlay talks to it: fetch (spec, info, route-files, snapshot, submit) and
   EventSource. */

const PAGE = `
  <main>
    <div data-astralis="Card" data-astralis-props='[{"variant":"outline","p":{"base":"2","md":"4"}}]'>
      <div data-astralis="Card.Body" data-astralis-props="[{}]"><span id="text">Hello</span></div>
    </div>
    <button id="trigger" data-astralis="Modal.Trigger Button" data-astralis-props='[{},{"variant":"ghost"}]'>Open</button>
    <button id="save" data-astralis="Button" data-astralis-props='[{"variant":"primary"}]'>Save</button>
    <div id="hostile" data-astralis="Box" data-astralis-props='[{"as":"&lt;img src=x onerror=alert(1)&gt;"}]'>x</div>
    <p id="plain">not a component</p>
  </main>`;

let dom;
let unmount;
let streams;
let requests;
let routeFiles;
let posts;
let submitResult;
let github;
let issues;
let similar;
let searched;
let opened;
let submitGate;

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

function newWindow(url) {
  dom = new JSDOM(`<!doctype html><html><head></head><body>${PAGE}</body></html>`, { url });
  const { window } = dom;
  window.open = (target) => opened.push(target);
  Object.assign(globalThis, {
    window,
    document: window.document,
    location: window.location,
    Element: window.Element,
    localStorage: window.localStorage,
    sessionStorage: window.sessionStorage,
  });
}

function setup() {
  streams = [];
  requests = [];
  routeFiles = ["app/about/page.tsx", "app/layout.tsx"];
  posts = [];
  opened = [];
  submitGate = null;
  submitResult = { ok: true, body: { number: 12, url: "https://github.com/paulandy789/astralis-ui/issues/12" } };
  github = { configured: true, repo: "paulandy789/astralis-ui", login: "sam", pending: null, error: null };
  similar = { duplicates: [], related: [] };
  searched = [];
  issues = [
    { number: 12, title: "Card loses its border", state: "open", stateReason: null, url: "https://github.com/paulandy789/astralis-ui/issues/12", comments: 2, labels: ["bug"], createdAt: "2026-10-01T00:00:00Z", updatedAt: new Date().toISOString() },
    { number: 9, title: "Tabs panel unreachable", state: "closed", stateReason: "completed", url: "https://github.com/paulandy789/astralis-ui/issues/9", comments: 0, labels: [], createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-02T00:00:00Z" },
    { number: 7, title: "Wish", state: "closed", stateReason: "not_planned", url: "https://github.com/paulandy789/astralis-ui/issues/7", comments: 0, labels: [], createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-02T00:00:00Z" },
  ];
  newWindow("http://localhost:3000/about");
  Object.assign(globalThis, {
    EventSource: FakeEventSource,
    fetch: async (url, init = {}) => {
      requests.push(url);
      const path = url.replace("/api/astralis-devtools/", "");
      if (init.method === "POST") {
        const sent = JSON.parse(init.body);
        if (path === "github/link") {
          return { ok: true, status: 200, json: async () => ({ url: `https://github.com/paulandy789/astralis-ui/issues/new?title=${encodeURIComponent(sent.description.title)}` }) };
        }
        if (path === "github/similar") {
          searched.push(sent);
          return { ok: true, status: 200, json: async () => similar };
        }
        posts.push({ path, body: sent });
        if (path === "snapshot") {
          const snapshot = { format: "astralis-snapshot/1", tree: sent.tree, description: sent.description, route: sent.route };
          const problems = sent.description.title.trim() ? [] : ["description.title is required (at most 200 characters)"];
          return { ok: true, status: 200, json: async () => ({ snapshot, problems }) };
        }
        if (path === "github/sign-in") {
          github = { ...github, pending: { userCode: "WDJB-MJHT", verificationUri: "https://github.com/login/device", expiresAt: Date.now() + 900_000 } };
          return { ok: true, status: 200, json: async () => github };
        }
        if (path === "github/sign-out") {
          github = { ...github, login: null, pending: null };
          return { ok: true, status: 200, json: async () => github };
        }
        await submitGate;
        return { ok: submitResult.ok, status: submitResult.ok ? 200 : 502, json: async () => submitResult.body };
      }
      const body = path === "spec"
        ? SPEC
        : path === "info"
          ? { library: { version: "0.8.0" }, framework: { name: "next", version: "16.3.3" }, react: "19.2.8" }
          : path.startsWith("route-files")
            ? { path: decodeURIComponent(path.split("=")[1]), files: routeFiles }
            : path === "github"
              ? github
              : path === "github/issues"
                ? { issues }
                : null;
      return { ok: body !== null, json: async () => body };
    },
  });
}

beforeEach(() => {
  setup();
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
const nav = (screen) => $(`.nav-button[data-screen="${screen}"]`);
const view = () => $(".view").textContent;
const isOpen = () => $(".panel").dataset.open === "true";
const click = (element) => element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true, composed: true }));
const move = (element) => element.dispatchEvent(new dom.window.MouseEvent("pointermove", { bubbles: true }));
const key = (init) => document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { bubbles: true, ...init }));
const openPanel = () => click($(".launcher-button.mark"));
/** Mount afresh, after a test changes what the stubbed bridge answers. */
const remount = () => {
  unmount();
  unmount = mountOverlay({ framework: "next" });
};
/** A full page load in the same tab: a new window, with the tab's storage. */
const load = (url = location.href) => {
  unmount();
  const kept = ["sessionStorage", "localStorage"].map((name) => [name, Object.entries(globalThis[name])]);
  dom.window.close();
  newWindow(url);
  for (const [name, entries] of kept) for (const [key, value] of entries) globalThis[name].setItem(key, value);
  unmount = mountOverlay({ framework: "next" });
};
/** A client-side navigation, reported by popstate. */
const go = (url) => {
  dom.window.history.pushState({}, "", url);
  dom.window.dispatchEvent(new dom.window.Event("popstate"));
};

const FINDINGS = {
  version: 2,
  files: 3,
  errors: 2,
  warnings: 1,
  results: [
    { file: "components/nav.tsx", errors: [{ code: "unknown-class", line: 4, column: 2, message: "no such class" }], warnings: [] },
    {
      file: "app/about/page.tsx",
      errors: [{ code: "invalid-recipe-value", line: 3, column: 16, message: 'Button: "primary" is not a variant value', component: "Button", prop: "variant", value: "primary" }],
      warnings: [{ code: "prefer-vstack", line: 7, column: 1, message: "Flex direction=\"column\" is a VStack", component: "Flex", prop: "direction", value: "column" }],
    },
  ],
};

/* ---- the frame --------------------------------------------------------------- */

test("mounts one launcher in a shadow root, once, with its fonts on the document", () => {
  assert.equal(document.querySelectorAll("astralis-devtools").length, 1);
  assert.equal(mountOverlay()(), undefined, "a second mount is a no-op");
  assert.equal(document.querySelectorAll("astralis-devtools").length, 1);
  assert.equal($(".launcher-button.mark").getAttribute("aria-expanded"), "false");
  assert.equal(isOpen(), false);
  assert.equal($(".panel").hasAttribute("inert"), true, "a closed panel takes no focus");
  assert.equal(streams[0].url, "/api/astralis-devtools/events");
  const fonts = document.getElementById("astralis-devtools-fonts");
  assert.match(fonts.textContent, /font-family:"Astralis DevTools Grotesk"/);
});

test("the launcher opens the panel on Home, with the counts, and it minimizes again", async () => {
  streams[0].emit("findings", FINDINGS);
  await tick();
  openPanel();
  assert.equal(isOpen(), true);
  assert.equal($(".launcher-button.mark").getAttribute("aria-expanded"), "true");
  assert.equal(nav("home").getAttribute("aria-current"), "page");
  const tiles = Object.fromEntries($$(".tile").map((t) => [t.dataset.screen, t.textContent]));
  assert.match(tiles.components, /^5Components5 kinds on this page/);
  assert.match(tiles.findings, /^2Findingsin 2 of 3 files/);
  assert.match(tiles.recommendations, /^1Recommendationsin 1 of 3 files/);
  assert.match(view(), /astralis-ui 0\.8\.0 {2}· {2}Next\.js 16\.3\.3 {2}· {2}React 19\.2\.8/);
  click($(".minimize"));
  assert.equal(isOpen(), false);
});

test("the launcher's dot and the sidebar count errors, then recommendations", () => {
  streams[0].emit("findings", FINDINGS);
  assert.equal($(".dot").hidden, false);
  assert.equal($(".dot").textContent, "2");
  assert.match($(".launcher-button.mark").getAttribute("aria-label"), /2 errors, 1 recommendation/);
  assert.equal(nav("findings").querySelector(".count").textContent, "2");
  assert.equal(nav("recommendations").querySelector(".count").textContent, "1");
  streams[0].emit("findings", { ...FINDINGS, errors: 0, results: [] });
  assert.equal($(".dot").className, "dot advice");
});

test("a tile goes to its screen, and the sidebar marks where you are", () => {
  openPanel();
  click($('.tile[data-screen="recommendations"]'));
  assert.equal(nav("recommendations").getAttribute("aria-current"), "page");
  assert.equal($(".crumbs").textContent, "Recommendations");
  click($(".brand"));
  assert.equal(nav("home").getAttribute("aria-current"), "page");
});

test("a page load, refreshed or navigated to, minimizes the panel and remembers its screen", () => {
  openPanel();
  click(nav("findings"));
  load();
  assert.equal(isOpen(), false);
  assert.equal($(".launcher-button.mark").getAttribute("aria-expanded"), "false");
  openPanel();
  assert.equal(nav("findings").getAttribute("aria-current"), "page");
  load("http://localhost:3000/pricing");
  assert.equal(isOpen(), false);
});

test("a panel an earlier version left marked open stays minimized", () => {
  sessionStorage.setItem("astralis-devtools:panel", JSON.stringify({ open: true, screen: "findings" }));
  load();
  assert.equal(isOpen(), false);
});

test("a hot reload that remounts the overlay on the same page leaves the panel open", () => {
  openPanel();
  click(nav("findings"));
  remount();
  assert.equal(isOpen(), true);
  assert.equal(nav("findings").getAttribute("aria-current"), "page");
  unmount();
  dom.window.history.pushState({}, "", "/pricing");
  unmount = mountOverlay({ framework: "next" });
  assert.equal(isOpen(), false, "but not on another page");
});

test("client-side navigation minimizes the panel; a query or a hash does not", (t) => {
  // Unmount before mocking, so the real interval is cleared by the real clearInterval.
  unmount();
  t.mock.timers.enable({ apis: ["setInterval"] });
  unmount = mountOverlay({ framework: "next" });
  openPanel();
  click(nav("recommendations"));
  for (const url of ["/about?tab=2", "/about?tab=2#team"]) {
    go(url);
    t.mock.timers.tick(1000);
    assert.equal(isOpen(), true, url);
  }
  dom.window.history.pushState({}, "", "/pricing");
  t.mock.timers.tick(1000);
  assert.equal(isOpen(), false);
  openPanel();
  assert.equal(nav("recommendations").getAttribute("aria-current"), "page", "reopening returns to the screen");
  go("/about");
  assert.equal(isOpen(), false, "Back minimizes without waiting for the poll");
});

test("where the browser has the Navigation API, navigation minimizes the panel at once", () => {
  dom.window.navigation = new dom.window.EventTarget();
  remount();
  openPanel();
  dom.window.history.pushState({}, "", "/pricing");
  dom.window.navigation.dispatchEvent(new dom.window.Event("currententrychange"));
  assert.equal(isOpen(), false);
});

test("leaving the page folds the panel, for a browser that restores the page on Back", () => {
  openPanel();
  dom.window.dispatchEvent(new dom.window.Event("pagehide"));
  assert.equal(isOpen(), false);
});

test("navigating ends picking, and the panel does not come back", () => {
  openPanel();
  click($(".sidebar-end .nav-button"));
  go("/pricing");
  assert.equal($(".toast").hidden, true);
  assert.equal($(".launcher-button[aria-label='Pick a component']").getAttribute("aria-pressed"), "false");
  assert.equal(isOpen(), false);
  click(document.getElementById("save"));
  assert.equal(isOpen(), false, "clicks reach the page again");
});

test("a picked component the new page does not have falls back to Components", () => {
  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.getElementById("save"));
  assert.equal($(".detail-head h2").textContent, "Button");
  go("/pricing");
  document.getElementById("save").remove();
  openPanel();
  assert.equal($(".detail-head"), null);
  assert.equal($(".crumbs").textContent, "Components");
});

test("so does one on a page React keeps hidden after navigating", () => {
  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.getElementById("save"));
  go("/pricing");
  document.querySelector("main").style.setProperty("display", "none", "important");
  openPanel();
  assert.equal($(".crumbs").textContent, "Components");
});

test("a picked component that is still there after navigating is returned to", () => {
  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.getElementById("save"));
  go("/pricing");
  openPanel();
  assert.equal($(".detail-head h2").textContent, "Button");
});

test("minimizing folds the panel to the launcher, stays folded across a reload, and restores where it was", () => {
  openPanel();
  click(nav("recommendations"));
  const minimize = $(".topbar .minimize");
  assert.equal(minimize.getAttribute("aria-label"), "Minimize to the launcher");
  minimize.focus();
  click(minimize);
  assert.equal(isOpen(), false);
  assert.equal($(".panel").hasAttribute("inert"), true, "a minimized panel takes no focus or clicks");
  assert.equal(shadow().activeElement, $(".launcher-button.mark"), "focus goes to the launcher, not the page");
  assert.deepEqual(JSON.parse(sessionStorage.getItem("astralis-devtools:panel")), { screen: "recommendations" });

  load();
  assert.equal(isOpen(), false, "still minimized after a reload");
  assert.equal($(".launcher-button.mark").getAttribute("aria-expanded"), "false");
  openPanel();
  assert.equal(nav("recommendations").getAttribute("aria-current"), "page");
});

test("Escape minimizes the panel when focus is inside it, and not from the page", () => {
  openPanel();
  key({ key: "Escape" });
  assert.equal(isOpen(), true, "an Escape meant for the page is left alone");
  nav("components").focus();
  nav("components").dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
  assert.equal(isOpen(), false);
  assert.equal(shadow().activeElement, $(".launcher-button.mark"));
});

/* ---- findings and recommendations -------------------------------------------------- */

test("Findings shows errors only, this page's files first, and says how many files have them", async () => {
  streams[0].emit("findings", FINDINGS);
  openPanel();
  click(nav("findings"));
  await tick();
  assert.match($(".summary").textContent, /2Errorsin 2 of 3 files checked/);
  assert.deepEqual($$(".section-title").map((t) => t.textContent), ["This page", "Elsewhere in the project"]);
  assert.deepEqual($$(".file-head .path").map((f) => f.textContent), ["app/about/page.tsx", "components/nav.tsx"]);
  assert.equal($$(".finding.warning").length, 0);
  assert.ok(requests.includes("/api/astralis-devtools/route-files?path=%2Fabout"));
});

test("a finding's component opens that very component on the page", async () => {
  streams[0].emit("findings", FINDINGS);
  openPanel();
  click(nav("findings"));
  await tick();
  click($$(".finding .chip").find((c) => c.textContent === "Button"));
  assert.equal($(".detail-head h2").textContent, "Button");
  assert.match($(".detail-head").textContent, /1 finding/);
  assert.match($(".chip.exact").textContent, /This one/);
  assert.deepEqual($$(".props tr").map((r) => r.textContent), ['variant"primary"']);
});

test("Recommendations shows warnings only", async () => {
  streams[0].emit("findings", FINDINGS);
  openPanel();
  click(nav("recommendations"));
  await tick();
  assert.match($(".summary").textContent, /1Recommendationin 1 of 3 files checked/);
  assert.equal($$(".finding.error").length, 0);
  assert.match(view(), /Flex direction="column" is a VStack/);
});

test("a clean project and a clean page say so", async () => {
  streams[0].emit("findings", { version: 1, files: 4, errors: 0, warnings: 0, results: [] });
  openPanel();
  click(nav("findings"));
  await tick();
  assert.equal($(".dot").hidden, true);
  assert.match(view(), /Nothing broken/);
  streams[0].emit("findings", { version: 2, files: 4, errors: 1, warnings: 0, results: [{ file: "x.tsx", errors: [{ code: "c", line: 1, column: 1, message: "m" }], warnings: [] }] });
  assert.match(view(), /Nothing broken in the 2 files that render this page/);
});

test("route files follow client-side navigation", async (t) => {
  // Unmount before mocking, so the real interval is cleared by the real clearInterval.
  unmount();
  t.mock.timers.enable({ apis: ["setInterval"] });
  unmount = mountOverlay({ framework: "next" });
  streams.at(-1).emit("findings", { version: 1, files: 4, errors: 1, warnings: 0, results: [{ file: "x.tsx", errors: [{ code: "c", line: 1, column: 1, message: "m" }], warnings: [] }] });
  routeFiles = ["app/pricing/page.tsx"];
  dom.window.history.pushState({}, "", "/pricing");
  t.mock.timers.tick(1000);
  await tick();
  openPanel();
  click(nav("findings"));
  assert.ok(requests.includes("/api/astralis-devtools/route-files?path=%2Fpricing"));
  assert.match(view(), /Nothing broken in the file that renders this page/);
});

test("when the bridge does not answer, the Next.js route to add is shown", () => {
  streams[0].emit("error", {});
  openPanel();
  click(nav("findings"));
  assert.match(view(), /app\/api\/astralis-devtools\/\[\.\.\.path\]\/route\.ts/);
  assert.match(view(), /npx astralis-cli init --devtools/);
  assert.match($(".status").textContent, /Bridge offline/);
});

/* ---- components ---------------------------------------------------------------- */

test("Components lists the page's components by kind; one opens, many expand", async () => {
  await tick();
  openPanel();
  click(nav("components"));
  const names = $$(".group-row .name").map((n) => n.textContent);
  assert.deepEqual(names, ["Box", "Button", "Card", "Card.Body", "Modal.Trigger"]);

  click($$(".group-row").find((r) => r.textContent.includes("Card.Body")));
  assert.equal($(".detail-head h2").textContent, "Card.Body");
  assert.equal($(".crumbs").textContent, "ComponentsCard.Body");
  click($(".crumb-link"));
  assert.equal(nav("components").getAttribute("aria-current"), "page");
});

test("several of one kind expand in place, and each opens its own page", () => {
  document.querySelector("main").insertAdjacentHTML("beforeend", `<button id="b2" data-astralis="Button" data-astralis-props='[{"variant":"solid"}]'>Cancel</button>`);
  unmount();
  unmount = mountOverlay({ framework: "next" });
  openPanel();
  click(nav("components"));
  const row = $$(".group-row").find((r) => r.textContent.includes("Button"));
  assert.equal(row.getAttribute("aria-expanded"), "false");
  click(row);
  assert.equal(row.getAttribute("aria-expanded"), "true");
  assert.equal(row.parentElement.dataset.open, "true");
  const instances = $$(".instance-row").map((r) => r.textContent);
  assert.deepEqual(instances, ['#1Savevariant="primary"', '#2Cancelvariant="solid"']);
  click($$(".instance-row")[1]);
  assert.match($(".detail-head").textContent, /2 of 2 on this page/);
});

test("the filter narrows the list", () => {
  openPanel();
  click(nav("components"));
  const input = $(".search input");
  input.value = "card";
  input.dispatchEvent(new dom.window.Event("input"));
  assert.deepEqual($$(".group-row .name").map((n) => n.textContent), ["Card", "Card.Body"]);
  input.value = "zzz";
  input.dispatchEvent(new dom.window.Event("input"));
  assert.match(view(), /No matches/);
});

/* ---- picking ------------------------------------------------------------------------ */

test("picking a component opens its page, and the page never sees the click", async () => {
  await tick();
  openPanel();
  click($(".launcher-button[aria-label='Pick a component']"));
  let pageClicks = 0;
  document.addEventListener("click", () => pageClicks++);
  assert.equal($(".launcher-button[aria-label='Pick a component']").getAttribute("aria-pressed"), "true");
  assert.equal(isOpen(), false, "the panel steps aside while picking");
  assert.equal($(".toast").hidden, false);

  const text = document.getElementById("text");
  move(text);
  assert.equal($(".highlight").hidden, false);
  assert.match($(".highlight .label").textContent, /^Card\.Body/);

  click(text);
  assert.equal(pageClicks, 0, "the picking click is swallowed");
  assert.equal(isOpen(), true);
  assert.equal($(".toast").hidden, true);
  assert.equal($(".detail-head h2").textContent, "Card.Body");
  assert.match($(".detail-head").textContent, /Server Component/);
  assert.equal($(".card .link").getAttribute("href"), "https://astralis-ui.com/docs/components/card");
  assert.match(view(), /No props beyond its defaults/);

  click($$(".chip").find((c) => c.textContent === "Card"));
  assert.equal($(".detail-head h2").textContent, "Card");
  assert.deepEqual($$(".props tr").map((r) => r.textContent), ['variant"outline"', 'p{"base":"2","md":"4"}']);
  assert.match(view(), /ContainsCard\.Body/);

  const before = pageClicks;
  click(document.getElementById("plain"));
  assert.equal(pageClicks, before + 1, "clicks reach the page again once picking stops");

  assert.equal($(".highlight").hidden, false, "the open component stays outlined");
  click(nav("findings"));
  assert.equal($(".highlight").hidden, true, "but not behind another screen");
  click(nav("components"));
  click($$(".group-row").find((r) => r.textContent.includes("Card.Body")));
  assert.equal($(".highlight").hidden, false);
  click($(".minimize"));
  assert.equal($(".highlight").hidden, true, "nor once the panel is minimized");
});

test("an element two components render onto shows the whole chain", async () => {
  await tick();
  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.getElementById("trigger"));
  assert.equal($(".detail-head h2").textContent, "Modal.Trigger");
  assert.match($(".detail-head .chain").textContent, /renders through Button/);
  assert.ok($$(".card .code").some((c) => c.textContent === "Button"));
  assert.deepEqual($$(".props tr").map((r) => r.textContent), ['variant"ghost"']);
});

/** The "Props it takes" section of the open component's page. */
const takes = () => $$(".view section").find((section) => section.querySelector(".section-title")?.textContent.startsWith("Props it takes"));
const propRow = (name) => [...takes().querySelectorAll(".prop-row")].find((row) => row.querySelector(".prop-name").textContent === name);

test("a component's page lists every prop it takes, its own open and each style group drawn when opened", async () => {
  await tick();
  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.querySelector('[data-astralis="Card"]'));
  const section = takes();
  assert.ok(section, "the section is there");
  const groups = [...section.querySelectorAll(".prop-group")];
  assert.deepEqual(groups.map((g) => g.querySelector(".group-label").textContent), ["Its own props", "Placement"]);
  assert.deepEqual(groups.map((g) => g.dataset.open), ["true", "false"]);
  assert.equal(groups[1].querySelectorAll(".prop-row").length, 0, "a closed group is not drawn");

  const variant = propRow("variant");
  assert.match(variant.textContent, /In use: "outline"/);
  assert.deepEqual([...variant.querySelectorAll(".val")].map((v) => v.textContent), SPEC.components.Card.props.variant);
  assert.equal(variant.querySelector(".val.on").textContent, "outline");
  assert.equal(propRow("hoverable").querySelector(".prop-type").textContent, "boolean");

  const head = groups[1].querySelector(".group-row");
  click(head);
  assert.equal(head.getAttribute("aria-expanded"), "true");
  assert.ok(groups[1].querySelectorAll(".prop-row").length > 10);
  const position = propRow("position");
  assert.ok(position, "placement's props are listed");

  // A long scale shows its first values and a count; the count opens the rest.
  const width = propRow("w");
  const more = width.querySelector("button.val.more");
  assert.match(more.textContent, /^\+\d+ more$/);
  click(more);
  assert.equal(propRow("w").querySelector("button.val.more"), null);
  assert.ok(propRow("w").querySelectorAll(".val").length > 9);
  assert.match(propRow("w").textContent, /or any length/);
});

test("the props search filters by name or value, opens what it finds, and survives the page redrawing", async () => {
  await tick();
  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.querySelector('[data-astralis="Card"]'));
  const input = takes().querySelector(".search input");
  typeInto(input, "elev");
  assert.deepEqual([...takes().querySelectorAll(".prop-name")].map((n) => n.textContent), ["variant"]);
  assert.equal(takes().querySelector(".val.hit").textContent, "elevated");
  assert.match(takes().querySelector(".section-title").textContent, /1 of \d+/);

  typeInto(input, "margin");
  assert.deepEqual([...takes().querySelectorAll(".prop-group .group-label")].map((n) => n.textContent), ["Placement"]);
  assert.equal(takes().querySelector(".prop-group").dataset.open, "true");
  assert.ok(propRow("m"));

  streams[0].emit("findings", FINDINGS);
  assert.equal(takes().querySelector(".search input"), input, "the search is kept when findings stream in");
  assert.equal(input.value, "margin");

  typeInto(input, "zzz");
  assert.match(takes().textContent, /No prop or value matches "zzz"/);
});

test("on a trigger wrapping a Button, both components the page wrote can be listed", async () => {
  await tick();
  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.getElementById("trigger"));
  const which = [...takes().querySelectorAll(".segmented button")];
  assert.deepEqual(which.map((b) => b.textContent), ["Modal.Trigger", "Button"]);
  click(which[1]);
  assert.equal(takes().querySelector('.segmented [aria-pressed="true"]').textContent, "Button");
  assert.match(propRow("variant").textContent, /In use: "ghost"/);
  assert.ok(propRow("colorScheme"));

  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.querySelector('[data-astralis="Card"]'));
  assert.equal(takes().querySelector(".segmented").hidden, true, "one component, no choice to make");
});

test("Escape stops picking and brings the panel back as it was", () => {
  openPanel();
  click($(".sidebar-end .nav-button"));
  assert.equal(isOpen(), false);
  key({ key: "Escape" });
  assert.equal($(".launcher-button[aria-label='Pick a component']").getAttribute("aria-pressed"), "false");
  assert.equal(isOpen(), true);
});

test("page data is shown as text, never parsed as markup", () => {
  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.getElementById("hostile"));
  assert.equal($$("img").length, 0);
  assert.match(view(), /<img src=x onerror=alert\(1\)>/);
});

/* ---- shortcuts and the launcher ---------------------------------------------------------- */

test("Shift+Alt+A minimizes and brings the panel back where it was; Shift+Alt+C picks, then opens the picked component", () => {
  openPanel();
  click(nav("findings"));
  key({ code: "KeyA", key: "Å", shiftKey: true, altKey: true });
  assert.equal(isOpen(), false);
  key({ code: "KeyA", key: "Å", shiftKey: true, altKey: true });
  assert.equal(isOpen(), true);
  assert.equal(nav("findings").getAttribute("aria-current"), "page", "back on the screen it was minimized on");
  key({ code: "KeyA", shiftKey: true, altKey: true });
  assert.equal(isOpen(), false);

  key({ code: "KeyC", shiftKey: true, altKey: true });
  assert.equal(isOpen(), false, "picking does not open the panel");
  assert.equal($(".toast").hidden, false);
  click(document.getElementById("save"));
  assert.equal(isOpen(), true);
  assert.equal($(".detail-head h2").textContent, "Button");
});

test("the launcher can be dragged, stays where it is left, and a drag is not a click", () => {
  const launcher = $(".launcher");
  const mark = $(".launcher-button.mark");
  const pointer = (type, target, x, y) =>
    target.dispatchEvent(new dom.window.MouseEvent(type, { bubbles: true, composed: true, clientX: x, clientY: y, button: 0 }));
  // It starts at the bottom, centred: jsdom lays it out 88px wide in a 1024×768 window.
  assert.equal(launcher.style.transform, "translate(468px, 712px)");
  // jsdom has no PointerEvent; a MouseEvent of the same type carries what the launcher reads.
  pointer("pointerdown", mark, 500, 740);
  pointer("pointermove", dom.window, 300, 440);
  pointer("pointerup", dom.window, 300, 440);
  click(mark);
  assert.equal(isOpen(), false, "the click that ends a drag does not open the panel");
  assert.match(launcher.style.transform, /^translate\(\d+px, \d+px\)$/);
  const saved = JSON.parse(localStorage.getItem("astralis-devtools:launcher"));
  assert.ok(saved.fx > 0 && saved.fx < 1 && saved.fy > 0 && saved.fy < 1, JSON.stringify(saved));

  unmount();
  unmount = mountOverlay({ framework: "next" });
  assert.equal($(".launcher").style.transform, launcher.style.transform, "the same spot after a reload");
  click($(".launcher-button.mark"));
  assert.equal(isOpen(), true, "a plain click still opens");
});

test("unmounting removes the overlay, its fonts and everything it listened to", () => {
  click($(".launcher-button[aria-label='Pick a component']"));
  unmount();
  unmount = null;
  assert.equal(document.querySelector("astralis-devtools"), null);
  assert.equal(document.getElementById("astralis-devtools-fonts"), null);
  assert.equal(streams[0].closed, true);
  let pageClicks = 0;
  document.addEventListener("click", () => pageClicks++);
  click(document.getElementById("plain"));
  assert.equal(pageClicks, 1, "no picking listener left behind");
});

/* ---- Report -------------------------------------------------------------------------- */

/** Past the report's 250 ms debounce and the stubbed bridge's reply. */
const settle = () => new Promise((done) => setTimeout(done, 320));
const typeInto = (element, value) => {
  element.value = value;
  element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
};

async function reportOn(id) {
  await tick();
  click($(".launcher-button[aria-label='Pick a component']"));
  click(document.getElementById(id));
  click(button("Report a problem"));
  await settle();
}

test("Report asks for a component first, and picking returns to it", () => {
  openPanel();
  click(nav("report"));
  assert.match(view(), /Which component is it\?/);
  click([...$(".view").querySelectorAll("button")].find((b) => b.textContent === "Pick a component"));
  assert.equal($(".toast").hidden, false);
  click(document.getElementById("text"));
  assert.equal(nav("report").getAttribute("aria-current"), "page");
  assert.match($(".target").textContent, /Card\.Body/);
});

test("the report shows the exact snapshot and cannot be sent without a title", async () => {
  await reportOn("text");
  assert.match($(".target").textContent, /Card\.Body/);
  const snap = posts.at(-1);
  assert.equal(snap.path, "snapshot");
  assert.equal(snap.body.tree[0].component, "Card.Body");
  assert.deepEqual(snap.body.tree[0].children, [{ redacted: true, length: 5 }], "page text is redacted by default");
  assert.equal(snap.body.route, "/about");
  assert.equal(snap.body.include.findings, true);
  assert.equal(snap.body.include.console, false);
  assert.match($(".json").textContent, /"format": "astralis-snapshot\/1"/);
  assert.match($(".problems").textContent, /title is required/);
  assert.equal(button("Create issue from here").disabled, true);
});

test("editing the form re-assembles the snapshot, and streamed findings do not wipe it", async () => {
  await reportOn("text");
  const title = $(".field");
  typeInto(title, "Card loses its border");
  streams[0].emit("findings", { version: 3, files: 1, errors: 0, warnings: 0, results: [] });
  assert.equal($(".field"), title, "the form was not rebuilt");
  assert.equal($(".field").value, "Card loses its border");
  await settle();
  assert.equal(posts.at(-1).body.description.title, "Card loses its border");
  assert.equal($(".problems").children.length, 0);
  assert.equal(button("Create issue from here").disabled, false);

  const includeText = $$(".toggle input")[0];
  includeText.checked = true;
  includeText.dispatchEvent(new dom.window.Event("change"));
  await settle();
  assert.deepEqual(posts.at(-1).body.tree[0].children, [{ text: "Hello" }]);
});

test("the form keeps its input across screens", async () => {
  await reportOn("text");
  typeInto($(".field"), "Kept");
  click(nav("home"));
  click(nav("report"));
  assert.equal($(".field").value, "Kept");
});

test("Send opens exactly the snapshot shown as a GitHub issue, clears the form and shows it in Your issues", async () => {
  await reportOn("text");
  typeInto($(".field"), "Card loses its border");
  await settle();
  const shown = JSON.parse($(".json").textContent);
  click(button("Create issue from here"));
  await settle();
  const submitted = posts.find((p) => p.path === "submit");
  assert.deepEqual(submitted.body, shown);
  assert.deepEqual(opened, [], "no tab opens by itself");
  assert.equal($(".report-status"), null, "the form is gone");
  assert.equal($('[data-tab="issues"]').getAttribute("aria-selected"), "true", "Your issues shows instead");
  assert.match($(".sent-card").textContent, /Created #12/);
  assert.match($(".sent-card").textContent, /To add a screenshot or a file, open the issue/);
  const link = $(".sent-card a");
  assert.equal(link.textContent, "Open #12 on GitHub");
  assert.equal(link.getAttribute("href"), "https://github.com/paulandy789/astralis-ui/issues/12");
  assert.equal(link.getAttribute("target"), "_blank");
  assert.equal($$(".issue-row").filter((r) => r.textContent.includes("#12")).length, 1, "listed once");

  click($('[data-tab="new"]'));
  assert.deepEqual($$(".field").map((f) => f.value), ["", "", ""], "the form is clear");
  assert.equal(sessionStorage.getItem("astralis-devtools:draft"), "null", "and so is the kept draft");
  click($('[data-tab="issues"]'));
  assert.equal($(".sent-card"), null, "the confirmation shows once");
});

test("a new issue shows before GitHub's list has it, once, and the list is read again", async () => {
  submitResult = { ok: true, body: { number: 40, url: "https://github.com/paulandy789/astralis-ui/issues/40" } };
  await reportOn("text");
  typeInto($(".field"), "Card loses its border");
  await settle();
  const reads = () => requests.filter((r) => r.endsWith("github/issues")).length;
  const before = reads();
  click(button("Create issue from here"));
  await settle();
  assert.match($$(".issue-row")[0].textContent, /Card loses its border#40 · Open · updated just now/);
  assert.equal($$(".issue-row").length, 4);
  assert.match($('[data-tab="issues"]').textContent, /Your issues \(4\)/);
  issues = [{ ...issues[0], number: 40, title: "From GitHub" }, ...issues];
  await new Promise((done) => setTimeout(done, 3100));
  assert.equal(reads(), before + 2);
  assert.equal($$(".issue-row").length, 4, "not listed twice");
  assert.match($$(".issue-row")[0].textContent, /From GitHub#40/);
  assert.match($(".sent-card").textContent, /Created #40/, "the confirmation outlives the refresh");
});

test("the button says Creating…, and a second press sends nothing", async () => {
  let release;
  submitGate = new Promise((done) => (release = done));
  await reportOn("text");
  typeInto($(".field"), "t");
  await settle();
  click(button("Create issue from here"));
  click(button("Creating…"));
  click(button("Copy JSON"));
  await tick();
  assert.equal(button("Creating…").disabled, true);
  assert.equal(button("Open GitHub's form instead").disabled, true);
  assert.equal($(".field").readOnly, true, "nothing typed now would be lost");
  click(nav("home"));
  click(nav("report"));
  await settle();
  assert.equal(button("Creating…").disabled, true, "coming back to the form does not arm it again");
  click(nav("home"));
  release();
  await settle();
  assert.equal(nav("home").getAttribute("aria-current"), "page", "a reader elsewhere is left there");
  assert.equal(posts.filter((p) => p.path === "submit").length, 1);
  click(nav("report"));
  assert.match($(".sent-card").textContent, /Created #12/);
});

test("keystrokes still waiting to be assembled are in what is sent", async () => {
  await reportOn("text");
  typeInto($(".field"), "Card");
  await settle();
  typeInto($(".field"), "Card loses its border");
  click(button("Create issue from here"));
  await settle();
  assert.equal(posts.find((p) => p.path === "submit").body.description.title, "Card loses its border");
});

test("a send that fails on a form since rebuilt is shown, with the text kept", async () => {
  let release;
  submitGate = new Promise((done) => (release = done));
  submitResult = { ok: false, body: { error: "Could not reach GitHub." } };
  await reportOn("text");
  typeInto($(".field"), "Kept");
  await settle();
  click(button("Create issue from here"));
  await tick();
  click(nav("home"));
  click(nav("report"));
  release();
  await settle();
  assert.match($(".report-status").textContent, /Could not reach GitHub/);
  assert.equal($(".field").value, "Kept");
  assert.equal(button("Create issue from here").disabled, false);
});

test("an unsent report keeps its words across a navigation and a page load", async () => {
  await reportOn("text");
  typeInto($(".field"), "Kept");
  const includeText = $$(".toggle input")[0];
  includeText.checked = true;
  includeText.dispatchEvent(new dom.window.Event("change"));
  go("/pricing");
  document.getElementById("text").parentElement.remove();
  openPanel();
  assert.match(view(), /Which component is it\?.*What you wrote is kept/);
  load();
  openPanel();
  assert.match(view(), /What you wrote is kept/);
  click([...$(".view").querySelectorAll("button")].find((b) => b.textContent === "Pick a component"));
  click(document.getElementById("text"));
  await settle();
  assert.equal($(".field").value, "Kept");
  assert.equal($$(".toggle input")[0].checked, false, "what to include is asked afresh");
});

test("the report has no screenshot of its own: the snapshot carries none, and nothing asks to capture the screen", async () => {
  await reportOn("text");
  typeInto($(".field"), "Card loses its border");
  await settle();
  assert.equal("screenshot" in posts.at(-1).body.include, false);
  assert.equal("screenshot" in posts.at(-1).body, false);
  assert.doesNotMatch(view(), /Screenshot/);
  assert.equal(button("Add…"), undefined);
  assert.equal($$("img").length, 0);
});

test("a failed send says so and keeps Copy and Download", async () => {
  submitResult = { ok: false, body: { error: "Could not reach GitHub (fetch failed)." } };
  await reportOn("text");
  typeInto($(".field"), "t");
  await settle();
  click(button("Create issue from here"));
  await settle();
  assert.match($(".report-status").textContent, /Could not reach GitHub.*Nothing was sent/);
  assert.equal($(".field").value, "t", "the form keeps its text");
  assert.equal(button("Create issue from here").disabled, false, "and can be sent again");
  assert.equal(button("Copy JSON").disabled, false);
  assert.equal(button("Download").disabled, false);
  assert.deepEqual(opened, []);
});

test("console errors are counted, and sent only when ticked", async () => {
  await reportOn("text");
  dom.window.console.error("Failed at http://localhost:3000/_next/app.js");
  typeInto($(".field"), "t");
  await settle();
  assert.match(view(), /Include console errors \(1\)/);
  assert.equal(posts.at(-1).body.include.console, false);
  const consoleBox = $$(".toggle input")[2];
  consoleBox.checked = true;
  consoleBox.dispatchEvent(new dom.window.Event("change"));
  await settle();
  assert.equal(posts.at(-1).body.include.console, true);
  assert.deepEqual(posts.at(-1).body.console, ["Failed at /_next/app.js"]);
});

/* ---- GitHub ------------------------------------------------------------------------ */

test("signed in: the account shows who, and Your issues lists each issue with where it stands", async () => {
  openPanel();
  click(nav("report"));
  await tick();
  assert.match($(".account").textContent, /^Ssam/);
  click($('.segmented [data-tab="issues"]'));
  await tick();
  assert.match($('.segmented [data-tab="issues"]').textContent, /Your issues \(3\)/);
  const rows = $$(".issue-row");
  assert.deepEqual(rows.map((r) => r.className), ["issue-row open", "issue-row done", "issue-row skipped"]);
  assert.match(rows[0].textContent, /Card loses its border#12 · Open · updated just now · 2 comments/);
  assert.match(rows[1].textContent, /Closed, done/);
  assert.match(rows[2].textContent, /Closed, not planned/);
  assert.equal(rows[0].getAttribute("href"), "https://github.com/paulandy789/astralis-ui/issues/12");
  click(nav("home"));
  assert.match($('.tile[data-screen="report"]').textContent, /^1Report a problemYour issues: 1 open, 2 closed/);
});

test("signed out: sending waits for a sign-in, which shows a code to enter on GitHub", async (t) => {
  github = { ...github, login: null };
  remount();
  await reportOn("text");
  assert.equal(button("Create issue from here").disabled, true);
  assert.match($(".account").textContent, /Sign in to report/);
  click(button("Sign in with GitHub"));
  await tick();
  await tick();
  assert.equal($(".device-code").textContent, "WDJB-MJHT");
  assert.equal($(".account .btn.primary").getAttribute("href"), "https://github.com/login/device");
  assert.match($(".account").textContent, /Waiting for you to enter it/);

  // GitHub accepts the code; the overlay sees it on its next look at the bridge.
  github = { ...github, login: "sam", pending: null };
  await new Promise((done) => setTimeout(done, 2100));
  assert.match($(".account").textContent, /sam/);
  assert.ok(requests.includes("/api/astralis-devtools/github/issues"), "the issues load once signed in");
  typeInto($(".field"), "Card loses its border");
  await settle();
  assert.equal(button("Create issue from here").disabled, false);

  click(button("Sign out"));
  await tick();
  await tick();
  assert.match($(".account").textContent, /Sign in to report/);
});

test("when GitHub sign-in is not set up, Report says how to report by hand", async () => {
  github = { configured: false, repo: "paulandy789/astralis-ui", login: null, pending: null, error: null };
  remount();
  openPanel();
  click(nav("report"));
  await tick();
  assert.match($(".notice").textContent, /not set up in this version.*Open GitHub's form instead/);
});

test("a likely duplicate is shown before sending, and the report can be added to it", async () => {
  similar = {
    duplicates: [{ number: 3, title: "Card loses its border", state: "open", url: "https://github.com/paulandy789/astralis-ui/issues/3" }],
    related: [{ number: 5, title: "Card padding", state: "open", url: "https://github.com/paulandy789/astralis-ui/issues/5" }],
  };
  submitResult = { ok: true, body: { number: 3, url: "https://github.com/paulandy789/astralis-ui/issues/3#issuecomment-1" } };
  await reportOn("text");
  typeInto($(".field"), "Border gone");
  await settle();
  assert.ok(searched.length >= 1, "the bridge was asked");
  assert.match($(".similar").textContent, /This may already be reported/);
  assert.match($(".similar").textContent, /#3 Card loses its border/);
  assert.match($(".similar").textContent, /Open issues about Card\.Body#5 Card padding/);
  click(button("Add my report here"));
  await settle();
  assert.equal(posts.at(-1).path, "submit?addTo=3");
  assert.equal($('[data-tab="issues"]').getAttribute("aria-selected"), "true");
  assert.match($(".sent-card").textContent, /Added your report to #3/);
  assert.equal($(".sent-card a").getAttribute("href"), "https://github.com/paulandy789/astralis-ui/issues/3#issuecomment-1");
  assert.equal($$(".issue-row").length, 3, "a comment opens no new issue");
  assert.equal($(".similar"), null, "the suggestion goes once it is acted on");
});

test("Open GitHub's form instead opens GitHub's own form, filled in, with no sign-in", async () => {
  github = { ...github, login: null };
  remount();
  await reportOn("text");
  typeInto($(".field"), "Border gone");
  await settle();
  assert.equal(button("Create issue from here").disabled, true, "sending through the app needs a sign-in");
  assert.equal(button("Open GitHub's form instead").disabled, false, "the form does not");
  click(button("Open GitHub's form instead"));
  await settle();
  assert.deepEqual(opened, ["https://github.com/paulandy789/astralis-ui/issues/new?title=Border%20gone"]);
  assert.match($(".report-status").textContent, /GitHub's form is open in a new tab/);
});
