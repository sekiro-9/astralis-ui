import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { browserEnvironment, browserName, recordConsoleErrors, treeFromElement } from "../src/client/report.mjs";
import { SPEC } from "./helpers.mjs";

const page = (html) => new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { url: "http://localhost:3000/about?x=1" });

const CARD = `
  <div id="card" data-astralis="Card" data-astralis-props='[{"variant":"outline"}]'>
    <section class="mine">
      <div data-astralis="Card.Body Box" data-astralis-props='[{},{"p":"4"}]'>Hello <b>world</b></div>
    </section>
    <button data-astralis="Modal.Trigger Button" data-astralis-props='[{},{"variant":"ghost"}]'>Open</button>
    <script>ignored()</script>
  </div>`;

test("the tree follows the page's components through plain elements, text redacted", () => {
  const { window } = page(CARD);
  const tree = treeFromElement(window.document.getElementById("card"), SPEC);
  assert.deepEqual(tree, [
    {
      component: "Card",
      props: { variant: "outline" },
      children: [
        { component: "Card.Body", props: {}, renders: ["Box"], children: [{ redacted: true, length: 5 }, { redacted: true, length: 5 }] },
        {
          component: "Modal.Trigger",
          props: {},
          children: [{ component: "Button", props: { variant: "ghost" }, children: [{ redacted: true, length: 4 }] }],
        },
      ],
    },
  ]);
});

test("page text is kept only when asked, and the overlay itself is never included", () => {
  const { window } = page(`<div id="root" data-astralis="Box" data-astralis-props="[{}]">Hi <span id="skip">secret</span></div>`);
  const doc = window.document;
  const withText = treeFromElement(doc.getElementById("root"), SPEC, { includeText: true, skip: doc.getElementById("skip") });
  assert.deepEqual(withText[0].children, [{ text: "Hi" }]);
});

test("a selection that is not a component still yields the components inside it", () => {
  const { window } = page(`<main id="m">loose text<div data-astralis="Badge" data-astralis-props="[{}]">new</div></main>`);
  const tree = treeFromElement(window.document.getElementById("m"), SPEC);
  assert.deepEqual(tree, [{ component: "Badge", props: {}, children: [{ redacted: true, length: 3 }] }]);
});

test("browser facts are a name and major version, a viewport and a colour mode", () => {
  assert.equal(browserName("Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/140.0.1 Safari/537.36"), "Chrome 140");
  assert.equal(browserName("Mozilla/5.0 Chrome/140.0 Safari/537.36 Edg/140.0"), "Edge 140");
  assert.equal(browserName("Mozilla/5.0 (Macintosh) Gecko/20100101 Firefox/131.0"), "Firefox 131");
  assert.equal(browserName("Mozilla/5.0 (Macintosh) AppleWebKit/605 Version/18.1 Safari/605.1"), "Safari 18");
  assert.equal(browserName("curl/8"), null);
  const { window } = page("");
  window.document.documentElement.classList.add("astralis-dark");
  const env = browserEnvironment(window);
  assert.equal(env.colorMode, "dark");
  assert.ok(Number.isInteger(env.viewport.width));
});

test("console errors are recorded cleaned, capped, and the console restored", () => {
  const { window } = page("");
  const seen = [];
  window.console.error = (...args) => seen.push(args.join(" "));
  const original = window.console.error;
  const recorder = recordConsoleErrors(window);
  window.console.error("Failed at http://localhost:3000/_next/app.js");
  assert.deepEqual(seen, ["Failed at http://localhost:3000/_next/app.js"], "the page still sees its own errors");
  window.dispatchEvent(new window.ErrorEvent("error", { message: "boom", error: new Error("boom") }));
  assert.equal(recorder.messages[0], "Failed at /_next/app.js");
  assert.match(recorder.messages[1], /^Error: boom/);
  for (let i = 0; i < 30; i++) window.console.error(`e${i}`);
  assert.equal(recorder.messages.length, 20);
  assert.equal(recorder.messages.at(-1), "e29");
  recorder.stop();
  assert.equal(window.console.error, original);
  window.console.error("after");
  assert.equal(recorder.messages.at(-1), "e29", "nothing is recorded once stopped");
});

/** A window whose screen capture, video and canvas are fakes: enough to drive captureScreenshot. */
function captureWindow({ sizes = [], decline = false } = {}) {
  const calls = { stopped: 0, requested: null, drawn: [] };
  const track = { stop: () => calls.stopped++ };
  const win = {
    navigator: {
      mediaDevices: {
        getDisplayMedia: async (options) => {
          calls.requested = options;
          if (decline) throw Object.assign(new Error("denied"), { name: "NotAllowedError" });
          return { getTracks: () => [track] };
        },
      },
    },
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    document: {
      createElement: (tag) =>
        tag === "video"
          ? { videoWidth: 2560, videoHeight: 1440, play: async () => {}, srcObject: null, muted: false }
          : {
              width: 0,
              height: 0,
              getContext: () => ({ drawImage: (_v, _x, _y, w, h) => calls.drawn.push([w, h]) }),
              toDataURL: () => `data:image/jpeg;base64,${"A".repeat(sizes.shift() ?? 10)}`,
            },
    },
  };
  return { win, calls };
}

test("a screenshot is scaled down until it fits, with the overlay hidden and the stream stopped", async () => {
  const { captureScreenshot } = await import("../src/client/report.mjs");
  const { win, calls } = captureWindow({ sizes: [400_000, 100] });
  const order = [];
  const url = await captureScreenshot({ win, hide: () => order.push("hide"), show: () => order.push("show") });
  assert.equal(url, `data:image/jpeg;base64,${"A".repeat(100)}`);
  assert.deepEqual(calls.drawn, [[1280, 720], [960, 540]], "1280 wide first, then smaller");
  assert.deepEqual(order, ["hide", "show"]);
  assert.equal(calls.stopped, 1);
  assert.equal(calls.requested.audio, false);
  assert.equal(calls.requested.preferCurrentTab, true);
});

test("a declined prompt or an image that never fits leaves nothing running", async () => {
  const { captureScreenshot } = await import("../src/client/report.mjs");
  const declined = captureWindow({ decline: true });
  await assert.rejects(captureScreenshot({ win: declined.win }), { name: "NotAllowedError" });

  const huge = captureWindow({ sizes: [400_000, 400_000, 400_000] });
  const order = [];
  await assert.rejects(captureScreenshot({ win: huge.win, show: () => order.push("show") }), /too large/);
  assert.deepEqual(order, ["show"], "the overlay comes back");
  assert.equal(huge.calls.stopped, 1);
});
