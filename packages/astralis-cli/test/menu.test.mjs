import { test } from "node:test";
import assert from "node:assert/strict";
import { banner, drawDone, drawOpen, press } from "../src/lib/menu.mjs";

/* The arrow-key menu, without a terminal: keys in, state and lines out. */

const menu = { question: "Which framework?", options: [{ label: "Next.js", hint: "App Router" }, { label: "React (Vite)" }], index: 0, done: null };

test("arrows move round the options, and Enter chooses", () => {
  const down = press(menu, { name: "down" });
  assert.equal(down.index, 1);
  assert.equal(press(down, { name: "down" }).index, 0, "it wraps");
  assert.equal(press(menu, { name: "up" }).index, 1);
  assert.equal(press(down, { name: "return" }).done, 1);
  assert.equal(press(menu, { name: "x" }), menu, "other keys do nothing");
});

test("a number chooses at once; Ctrl+C and Esc cancel", () => {
  assert.equal(press(menu, { sequence: "2" }).done, 1);
  assert.equal(press(menu, { sequence: "3" }).done, null, "only listed numbers");
  assert.equal(press(menu, { name: "c", ctrl: true }).done, "cancel");
  assert.equal(press(menu, { name: "escape" }).done, "cancel");
});

test("the open menu marks the current option and shows its hint; the answer folds to one line", () => {
  assert.deepEqual(drawOpen(menu, { color: false }), [
    "◆  Which framework?",
    "│  ● Next.js  App Router",
    "│  ○ React (Vite)",
    "└  ↑/↓ to move · enter to choose",
  ]);
  assert.deepEqual(drawDone({ ...menu, done: 1 }, { color: false }), ["◇  Which framework? › React (Vite)"]);
  assert.deepEqual(drawDone({ ...menu, done: "cancel" }, { color: false }), ["◇  Which framework? · cancelled"]);
});

test("the banner carries the name, the version and what is happening, in colour only when asked", () => {
  const plain = banner({ version: "0.5.0", subtitle: "Creating my-app", color: false });
  assert.match(plain, /Astralis CLI v0.5.0/);
  assert.match(plain, /Creating my-app/);
  assert.doesNotMatch(plain, /\u001b/);
  assert.match(banner({ version: "0.5.0", subtitle: "x" }), /\u001b\[38;2;234;179;8m/, "the brand yellow");
});
