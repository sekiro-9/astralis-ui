import { describe, expect, it } from "vitest";
import {
  isInHigherOverlay,
  isOverlayEventHandled,
  isTopOverlay,
  markOverlayEventHandled,
  lockBodyScroll,
  popOverlay,
  pushOverlay,
  unlockBodyScroll,
} from "./overlay-stack";

/* The module holds shared state on purpose (that IS the feature), so each
   test fully unwinds what it pushes/locks. */

describe("overlay stack ordering", () => {
  it("only the most recently opened overlay is topmost", () => {
    const modal = pushOverlay();
    const drawer = pushOverlay();

    expect(isTopOverlay(drawer)).toBe(true);
    expect(isTopOverlay(modal)).toBe(false);

    popOverlay(drawer);
    popOverlay(modal);
  });

  it("closing the top layer promotes the one underneath (Escape peels one at a time)", () => {
    const modal = pushOverlay();
    const drawer = pushOverlay();

    popOverlay(drawer); // topmost handled Escape and closed
    expect(isTopOverlay(modal)).toBe(true);

    popOverlay(modal);
    expect(isTopOverlay(modal)).toBe(false);
  });

  it("tolerates out-of-order closing (lower overlay unmounts first)", () => {
    const lower = pushOverlay();
    const upper = pushOverlay();

    popOverlay(lower);
    expect(isTopOverlay(upper)).toBe(true);

    popOverlay(upper);
  });

  it("popping the same handle twice is harmless", () => {
    const a = pushOverlay();
    const b = pushOverlay();
    popOverlay(a);
    popOverlay(a);
    expect(isTopOverlay(b)).toBe(true);
    popOverlay(b);
  });
});

describe("layer containment and transient layers", () => {
  it("a node inside a higher layer is reported; a lower layer's node is not", () => {
    const lowerNode = document.createElement("div");
    const higherNode = document.createElement("div");
    const lower = pushOverlay({ contains: (n) => lowerNode.contains(n) });
    const higher = pushOverlay({ contains: (n) => higherNode.contains(n) });

    expect(isInHigherOverlay(lower, higherNode)).toBe(true);
    expect(isInHigherOverlay(higher, lowerNode)).toBe(false);
    expect(isInHigherOverlay(lower, document.createElement("span"))).toBe(false);

    popOverlay(higher);
    popOverlay(lower);
  });

  it("ignoreTransient looks through tooltip-like layers, plain checks do not", () => {
    const modal = pushOverlay();
    const tooltip = pushOverlay({ transient: true });

    expect(isTopOverlay(modal)).toBe(false);
    expect(isTopOverlay(modal, { ignoreTransient: true })).toBe(true);

    const popover = pushOverlay();
    expect(isTopOverlay(modal, { ignoreTransient: true })).toBe(false);

    popOverlay(popover);
    popOverlay(tooltip);
    popOverlay(modal);
  });

  it("remembers which events a layer already consumed", () => {
    const event = new KeyboardEvent("keydown", { key: "Escape" });
    expect(isOverlayEventHandled(event)).toBe(false);
    markOverlayEventHandled(event);
    expect(isOverlayEventHandled(event)).toBe(true);
  });
});

describe("refcounted body scroll lock", () => {
  it("locks on first overlay and restores the ORIGINAL overflow only after the last unlock", () => {
    document.body.style.overflow = "scroll"; // a page with its own styling

    lockBodyScroll(); // modal opens
    expect(document.body.style.overflow).toBe("hidden");

    lockBodyScroll(); // drawer opens on top
    unlockBodyScroll(); // drawer closes — modal still open

    // The P0 bug: this used to restore scroll under the still-open modal.
    expect(document.body.style.overflow).toBe("hidden");

    unlockBodyScroll(); // modal closes
    expect(document.body.style.overflow).toBe("scroll");

    document.body.style.overflow = "";
  });

  it("extra unlocks don't go negative or clobber a later lock", () => {
    document.body.style.overflow = "";

    unlockBodyScroll(); // stray call with nothing locked
    lockBodyScroll();
    expect(document.body.style.overflow).toBe("hidden");
    unlockBodyScroll();
    expect(document.body.style.overflow).toBe("");
  });
});
