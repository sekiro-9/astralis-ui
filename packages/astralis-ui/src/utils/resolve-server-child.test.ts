import { describe, expect, it } from "vitest";
import { createElement, isValidElement } from "react";
import { resolveServerChild } from "./resolve-server-child";

/** Shape React uses for children streamed out of a Server Component. */
function lazyNode(result: unknown) {
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: result,
    _init: (payload: unknown) => payload,
  };
}

describe("resolveServerChild", () => {
  it("passes plain elements through untouched", () => {
    const el = createElement("button", null, "x");
    expect(resolveServerChild(el)).toBe(el);
  });

  it("passes primitives through untouched", () => {
    expect(resolveServerChild("text")).toBe("text");
    expect(resolveServerChild(null)).toBe(null);
  });

  it("unwraps a lazy node to the element inside", () => {
    const el = createElement("button", null, "x");
    const resolved = resolveServerChild(lazyNode(el) as never);
    expect(resolved).toBe(el);
    expect(isValidElement(resolved)).toBe(true);
  });

  it("unwraps nested lazy nodes", () => {
    const el = createElement("span");
    expect(resolveServerChild(lazyNode(lazyNode(el)) as never)).toBe(el);
  });
});
