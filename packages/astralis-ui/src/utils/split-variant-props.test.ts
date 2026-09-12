import { describe, expect, it } from "vitest";

import { splitVariantProps } from "./split-variant-props";

describe("splitVariantProps", () => {
  it("routes each key to the first group that lists it, the rest to the last bucket", () => {
    const own = ["size", "gap"];
    const box = ["gap", "p"];
    const [ownProps, boxProps, htmlProps] = splitVariantProps(
      { size: "lg", gap: "2", p: "4", id: "x", onClick: undefined },
      own,
      box,
    );

    expect(ownProps).toEqual({ size: "lg", gap: "2" });
    expect(boxProps).toEqual({ p: "4" });
    expect(htmlProps).toEqual({ id: "x", onClick: undefined });
  });

  it("ignores inherited keys", () => {
    const props = Object.create({ inherited: true }) as Record<string, unknown>;
    props.own = 1;
    const [groupProps, htmlProps] = splitVariantProps(props, ["inherited"]);

    expect(groupProps).toEqual({});
    expect(htmlProps).toEqual({ own: 1 });
  });

  it("gives the same answer when a group array is reused", () => {
    const keys = ["a"];
    splitVariantProps({ a: 1 }, keys);
    const [first, rest] = splitVariantProps({ a: 2, b: 3 }, keys);

    expect(first).toEqual({ a: 2 });
    expect(rest).toEqual({ b: 3 });
  });
});
