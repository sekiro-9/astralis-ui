import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Modal } from "./modal";
import { Popover } from "./popover";
import { Tooltip } from "./tooltip";
import { resolveSlotChild } from "./slot";

// scripts/measure-content.mjs matches this phrase to record a slot part's
// content as "element"; Studio inserts parts by that record.
const WANTS_ELEMENT = /must be a React element/;

describe("slot parts", () => {
  it.each([["text"], [undefined], [null], [42]])("refuse a non-element child (%s) in React's words", (child) => {
    expect(() => resolveSlotChild(child)).toThrow(WANTS_ELEMENT);
  });

  it("accept an element", () => {
    const button = createElement("button", null, "Open");
    expect(resolveSlotChild(button)).toBe(button);
  });

  it.each([
    ["Modal.Trigger", () => createElement(Modal, null, createElement(Modal.Trigger, null, "probe"))],
    ["Popover.Trigger", () => createElement(Popover, null, createElement(Popover.Trigger, null, "probe"))],
    ["Tooltip.Trigger", () => createElement(Tooltip, null, createElement(Tooltip.Trigger, null, "probe"))],
  ])("%s given text fails the way the content probe expects", (_, tree) => {
    expect(() => renderToString(tree())).toThrow(WANTS_ELEMENT);
  });
});
