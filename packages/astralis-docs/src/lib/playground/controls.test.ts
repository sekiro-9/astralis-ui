import { describe, expect, it } from "vitest";
import type { PropRow } from "@/modules/docs/props-table";
import { COLOR_SCHEMES, COLOR_SCHEME_TYPE } from "@/modules/demos/color-schemes";
import {
  deriveControl,
  deriveControls,
  initialState,
  liveProps,
  parseUnion,
  styleControls,
  UNSET,
  unquote,
} from "./controls";

const row = (partial: Partial<PropRow> & Pick<PropRow, "prop" | "type">): PropRow => ({
  description: "",
  ...partial,
});

describe("unquote", () => {
  it("strips the display quotes a default carries", () => {
    expect(unquote(`"subtle"`)).toBe("subtle");
    expect(unquote(`'sm'`)).toBe("sm");
  });

  it("leaves unquoted values alone", () => {
    expect(unquote("false")).toBe("false");
    expect(unquote("0")).toBe("0");
  });

  it("passes undefined through, so 'no default' stays distinguishable from empty", () => {
    expect(unquote(undefined)).toBeUndefined();
  });
});

describe("parseUnion", () => {
  it("reads a union of string literals", () => {
    expect(parseUnion(`"solid" | "subtle" | "outline"`)).toEqual(["solid", "subtle", "outline"]);
  });

  it("rejects prose", () => {
    expect(parseUnion("all 15 schemes")).toBeNull();
    expect(parseUnion(`"xs" – "9xl" (type scale)`)).toBeNull();
  });

  it("rejects a union with any non-literal member", () => {
    // Half-parsing this would offer a picker that silently drops the real options.
    expect(parseUnion(`"base" | "muted" | status tokens`)).toBeNull();
    expect(parseUnion(`"a" | number`)).toBeNull();
  });

  it("rejects a single literal — one option is not a choice", () => {
    expect(parseUnion(`"only"`)).toBeNull();
  });

  it("rejects a grouped row that looks like a union at a glance", () => {
    // Real row from text-props. A greedy literal match read `"italic" · "underline"`
    // as ONE member and handed back a bogus option list.
    expect(parseUnion(`"italic" · "underline" | "line-through" | "overline" | "none"`)).toBeNull();
  });
});

describe("deriveControl", () => {
  it("gives few short options a chip row", () => {
    const control = deriveControl(
      row({ prop: "size", type: `"xs" | "sm" | "md" | "lg"`, default: `"sm"` }),
    );
    expect(control).toEqual({
      kind: "chips",
      prop: "size",
      options: ["xs", "sm", "md", "lg"],
      initial: "sm",
      optional: false,
    });
  });

  it("gives many options a dropdown instead", () => {
    const control = deriveControl(
      row({ prop: "weight", type: `"thin" | "light" | "normal" | "medium" | "bold" | "black"` }),
    );
    expect(control?.kind).toBe("select");
  });

  it("gives long option labels a dropdown even when there are few", () => {
    const control = deriveControl(
      row({ prop: "direction", type: `"row" | "column" | "row-reverse" | "column-reverse"` }),
    );
    expect(control?.kind).toBe("select");
  });

  it("starts at the documented default", () => {
    expect(
      deriveControl(row({ prop: "variant", type: `"a" | "b" | "c"`, default: `"c"` }))?.initial,
    ).toBe("c");
  });

  describe("unset state", () => {
    it("starts unset when no default is documented", () => {
      // NOT the first option: codegen cannot tell a guess from a choice, so it
      // would emit variant="a" on a component nobody configured.
      const control = deriveControl(row({ prop: "variant", type: `"a" | "b"` }));
      expect(control).toMatchObject({ initial: UNSET, optional: true });
    });

    it("starts unset when the documented default isn't a selectable value", () => {
      // Alert's colorScheme is "from status" — derived, not one of the hues.
      const control = deriveControl(
        row({ prop: "colorScheme", type: `"red" | "blue"`, default: "from status" }),
      );
      expect(control).toMatchObject({ initial: UNSET, optional: true });
    });

    it("is not optional when the default is a real option", () => {
      expect(
        deriveControl(row({ prop: "variant", type: `"a" | "b"`, default: `"b"` })),
      ).toMatchObject({ initial: "b", optional: false });
    });

    it("carries the unset value into the starting state", () => {
      const controls = deriveControls([row({ prop: "variant", type: `"a" | "b"` })]);
      expect(initialState(controls)).toEqual({ variant: UNSET });
    });
  });

  describe("liveProps", () => {
    it("drops unset props so the component keeps its own default", () => {
      // Passing variant="" would hand cva an empty key and drop the recipe.
      expect(liveProps({ variant: UNSET, size: "lg" })).toEqual({ size: "lg" });
    });

    it("keeps false and zero, which are real values", () => {
      expect(liveProps({ disabled: false, value: 0 })).toEqual({ disabled: false, value: 0 });
    });
  });

  it("resolves the prose colorScheme type to the real hue list", () => {
    // The rule that replaces a per-component `control` override on every hue.
    const control = deriveControl(
      row({ prop: "colorScheme", type: COLOR_SCHEME_TYPE, default: `"gray"` }),
    );
    expect(control?.kind).toBe("select");
    expect(control).toMatchObject({ options: COLOR_SCHEMES, initial: "gray" });
  });

  it("includes the semantic hues that were once undocumented", () => {
    const control = deriveControl(row({ prop: "colorScheme", type: COLOR_SCHEME_TYPE }));
    expect(control && "options" in control ? control.options : []).toEqual(
      expect.arrayContaining(["error", "warning", "success", "info"]),
    );
  });

  it("turns boolean into a switch, defaulting to false when undocumented", () => {
    expect(deriveControl(row({ prop: "loading", type: "boolean" }))).toEqual({
      kind: "switch",
      prop: "loading",
      initial: false,
    });
    expect(deriveControl(row({ prop: "open", type: "boolean", default: "true" }))?.initial).toBe(
      true,
    );
  });

  it("turns string into a text box", () => {
    expect(deriveControl(row({ prop: "placeholder", type: "string" }))?.kind).toBe("text");
  });

  it("turns number into a number box, starting at the documented default", () => {
    expect(deriveControl(row({ prop: "max", type: "number", default: "100" }))).toEqual({
      kind: "number",
      prop: "max",
      initial: 100,
    });
  });

  it("starts a number at 0 when the default is absent or unparseable", () => {
    expect(deriveControl(row({ prop: "value", type: "number" }))?.initial).toBe(0);
    expect(deriveControl(row({ prop: "rows", type: "number", default: "auto" }))?.initial).toBe(0);
  });

  it("declines props it cannot edit honestly", () => {
    expect(deriveControl(row({ prop: "leftIcon", type: "ReactNode" }))).toBeNull();
    expect(deriveControl(row({ prop: "as", type: "ElementType" }))).toBeNull();
    expect(deriveControl(row({ prop: "onChange", type: "(value: string) => void" }))).toBeNull();
  });

  it("declines grouped rows that name several props at once", () => {
    // These exist in box/stack/pagination/text and are documentation groupings,
    // not single props — offering a control would write nonsense JSX.
    expect(deriveControl(row({ prop: "p · px · py", type: `"0.5" – "96" (spacing scale)` }))).toBeNull();
    expect(deriveControl(row({ prop: "alignItems · justifyContent", type: "Flex props" }))).toBeNull();
    expect(deriveControl(row({ prop: "Pagination.Pages", type: `"a" | "b"` }))).toBeNull();
  });

  it("declines a grouped row even when its type parses as a union", () => {
    // The backstop: the prop name alone disqualifies it, whatever the type says.
    expect(
      deriveControl(
        row({ prop: "fontStyle · textDecoration", type: `"underline" | "overline" | "none"` }),
      ),
    ).toBeNull();
  });

  it("declines an override on a grouped row too", () => {
    expect(
      deriveControl(row({ prop: "p · px", type: "prose", control: { kind: "switch" } })),
    ).toBeNull();
  });

  describe("explicit control overrides", () => {
    it("omit keeps a prop in the table but out of the panel", () => {
      expect(
        deriveControl(row({ prop: "variant", type: `"a" | "b"`, control: { kind: "omit" } })),
      ).toBeNull();
    });

    it("chips/select take their options from the override", () => {
      expect(
        deriveControl(
          row({
            prop: "hue",
            type: "prose",
            default: `"y"`,
            control: { kind: "chips", options: ["x", "y"] },
          }),
        ),
      ).toEqual({ kind: "chips", prop: "hue", options: ["x", "y"], initial: "y", optional: false });
    });

    it("an override with no documented default still starts unset", () => {
      expect(
        deriveControl(
          row({ prop: "hue", type: "prose", control: { kind: "select", options: ["x", "y"] } }),
        ),
      ).toMatchObject({ initial: UNSET, optional: true });
    });

    it("an override wins over a parseable type", () => {
      expect(
        deriveControl(row({ prop: "v", type: `"a" | "b"`, control: { kind: "text" } }))?.kind,
      ).toBe("text");
    });
  });
});

describe("styleControls", () => {
  const tokens = {
    p: ["1", "2", "0.5", "1.5", "10"],
    rounded: ["none", "sm", "md", "lg", "full"],
    bg: ["base", "subtle", "muted", "raised", "inverted", "transparent"],
  };

  it("starts every style prop unset — the component's own default applies", () => {
    for (const control of styleControls(["p", "rounded"], tokens)) {
      expect(control).toMatchObject({ initial: UNSET, optional: true });
    }
  });

  it("re-sorts numeric scales, which Object.keys reorders", () => {
    // Object.keys puts integer-like keys first, so a spacing map comes back as
    // 1,2,10,0.5,1.5 and the picker would read as nonsense.
    const control = styleControls(["p"], tokens)[0];
    expect(control && "options" in control ? control.options : []).toEqual([
      "0.5",
      "1",
      "1.5",
      "2",
      "10",
    ]);
  });

  it("leaves word scales in their declared order", () => {
    const control = styleControls(["rounded"], tokens)[0];
    expect(control && "options" in control ? control.options : []).toEqual(tokens.rounded);
  });

  it("uses chips for short lists and a dropdown for long ones", () => {
    expect(styleControls(["rounded"], tokens)[0].kind).toBe("chips");
    expect(styleControls(["bg"], tokens)[0].kind).toBe("select");
  });

  it("skips props the props table already documents", () => {
    // Flex documents `direction` as a real row AND accepts it as a style prop.
    // Two controls on one state key would render twice and fight each other.
    expect(styleControls(["p", "rounded"], tokens, new Set(["rounded"])).map((c) => c.prop)).toEqual(
      ["p"],
    );
  });

  it("skips props the component has no tokens for", () => {
    // Grid props asked of a Box entry, say — offering them would generate a
    // prop that resolves to no class and silently does nothing.
    expect(styleControls(["columns", "p"], tokens).map((c) => c.prop)).toEqual(["p"]);
  });
});

describe("deriveControls / initialState", () => {
  const rows = [
    row({ prop: "variant", type: `"solid" | "subtle"`, default: `"subtle"` }),
    row({ prop: "children", type: "ReactNode" }),
    row({ prop: "disabled", type: "boolean", default: "false" }),
  ];

  it("drops the rows that yield no control", () => {
    expect(deriveControls(rows).map((c) => c.prop)).toEqual(["variant", "disabled"]);
  });

  it("builds the starting state from each control's initial value", () => {
    expect(initialState(deriveControls(rows))).toEqual({ variant: "subtle", disabled: false });
  });

  it("returns nothing when no row is editable — the signal to hide the tab", () => {
    expect(deriveControls([row({ prop: "children", type: "ReactNode" })])).toEqual([]);
  });
});
