import { describe, expect, it } from "vitest";
import type { PropRow } from "@/modules/docs/props-table";
import { dedent, generateJsx, jsLiteral } from "./codegen";

const rows: PropRow[] = [
  { prop: "variant", type: `"solid" | "subtle" | "outline"`, default: `"subtle"`, description: "" },
  { prop: "size", type: `"xs" | "sm" | "lg"`, default: `"sm"`, description: "" },
  { prop: "disabled", type: "boolean", default: "false", description: "" },
  { prop: "loading", type: "boolean", description: "" },
  { prop: "label", type: "string", description: "" },
];

const gen = (props: Record<string, string | boolean>, children?: string) =>
  generateJsx({ tag: "Badge", props, rows, children });

const IMPORT = `import { Badge } from "astralis-ui";`;

describe("dedent", () => {
  it("strips the shared indent a template literal picks up", () => {
    expect(dedent("\n    <A />\n      <B />\n    <C />\n  ")).toBe("<A />\n  <B />\n<C />");
  });

  it("ignores blank lines when measuring, so one stray line can't flatten it", () => {
    expect(dedent("    <A />\n\n    <B />")).toBe("<A />\n\n<B />");
  });

  it("leaves already-flush source alone", () => {
    expect(dedent("<A />\n<B />")).toBe("<A />\n<B />");
  });
});

describe("jsLiteral", () => {
  it("writes object keys unquoted, the way JSX is actually written", () => {
    expect(jsLiteral({ value: "sm", label: "Small" })).toBe(`{ value: "sm", label: "Small" }`);
  });

  it("quotes keys that aren't identifiers", () => {
    expect(jsLiteral({ "data-id": 1 })).toBe(`{ "data-id": 1 }`);
  });

  it("keeps a short array on one line", () => {
    expect(jsLiteral(["a", "b"])).toBe(`["a", "b"]`);
  });

  it("breaks a long array one item per line, with a trailing comma", () => {
    expect(
      jsLiteral([
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
      ]),
    ).toBe(`[\n  { value: "sm", label: "Small" },\n  { value: "md", label: "Medium" },\n]`);
  });
});

describe("generateJsx", () => {
  it("emits an import line and the element", () => {
    expect(gen({}, "Hi")).toBe(`${IMPORT}\n\n<Badge>Hi</Badge>\n`);
  });

  describe("default omission — the rule that makes output pasteable", () => {
    it("drops every prop still at its documented default", () => {
      expect(gen({ variant: "subtle", size: "sm", disabled: false }, "Hi")).toBe(
        `${IMPORT}\n\n<Badge>Hi</Badge>\n`,
      );
    });

    it("keeps props that differ from the default", () => {
      expect(gen({ variant: "outline", size: "sm" }, "Hi")).toBe(
        `${IMPORT}\n\n<Badge variant="outline">Hi</Badge>\n`,
      );
    });

    it("keeps several, in row order", () => {
      expect(gen({ variant: "solid", size: "lg" }, "Hi")).toBe(
        `${IMPORT}\n\n<Badge variant="solid" size="lg">Hi</Badge>\n`,
      );
    });

    it("compares against the default with its display quotes stripped", () => {
      // `default` is the string `"subtle"` including quotes; the control's value
      // is bare `subtle`. Getting this wrong emits every prop, every time.
      expect(gen({ variant: "subtle" }, "Hi")).not.toContain("variant");
    });
  });

  describe("booleans", () => {
    it("emits a true boolean bare, not ={true}", () => {
      expect(gen({ disabled: true }, "Hi")).toBe(`${IMPORT}\n\n<Badge disabled>Hi</Badge>\n`);
    });

    it("omits a false boolean even when no default is documented", () => {
      expect(gen({ loading: false }, "Hi")).toBe(`${IMPORT}\n\n<Badge>Hi</Badge>\n`);
    });

    it("emits a true boolean when no default is documented", () => {
      expect(gen({ loading: true }, "Hi")).toBe(`${IMPORT}\n\n<Badge loading>Hi</Badge>\n`);
    });
  });

  describe("numbers", () => {
    const numRows: PropRow[] = [
      { prop: "max", type: "number", default: "100", description: "" },
      { prop: "value", type: "number", description: "" },
    ];

    it("emits numbers in braces, not quotes", () => {
      // `max="50"` would pass the string "50" and silently mistype the prop.
      expect(generateJsx({ tag: "Progress", props: { max: 50 }, rows: numRows })).toContain(
        "max={50}",
      );
    });

    it("drops a number still at its documented default", () => {
      expect(generateJsx({ tag: "Progress", props: { max: 100 }, rows: numRows })).toBe(
        `import { Progress } from "astralis-ui";\n\n<Progress />\n`,
      );
    });

    it("emits a number with no documented default, including zero", () => {
      expect(generateJsx({ tag: "Progress", props: { value: 0 }, rows: numRows })).toContain(
        "value={0}",
      );
    });
  });

  describe("unset", () => {
    it("emits nothing for an unset enum", () => {
      // The rest state of a prop whose default is derived or undocumented.
      expect(gen({ variant: "", size: "sm" }, "Hi")).toBe(`${IMPORT}\n\n<Badge>Hi</Badge>\n`);
    });

    it("emits nothing for an emptied text box", () => {
      // `label=""` is noise, not configuration.
      expect(gen({ label: "" }, "Hi")).toBe(`${IMPORT}\n\n<Badge>Hi</Badge>\n`);
    });

    it("emits the prop once a value is chosen", () => {
      expect(gen({ variant: "outline" }, "Hi")).toContain(`variant="outline"`);
    });
  });

  it("always emits a string prop with no documented default", () => {
    // No safe assumption exists for strings, so silence would be a lie.
    expect(gen({ label: "Save" }, "Hi")).toBe(`${IMPORT}\n\n<Badge label="Save">Hi</Badge>\n`);
  });

  it("emits an unknown prop rather than dropping it", () => {
    expect(gen({ mystery: "x" }, "Hi")).toContain(`mystery="x"`);
  });

  describe("children", () => {
    it("self-closes when there are none", () => {
      expect(generateJsx({ tag: "Spinner", props: { size: "lg" }, rows })).toBe(
        `import { Spinner } from "astralis-ui";\n\n<Spinner size="lg" />\n`,
      );
    });

    it("self-closes with no props either", () => {
      expect(generateJsx({ tag: "Spinner", props: {}, rows })).toBe(
        `import { Spinner } from "astralis-ui";\n\n<Spinner />\n`,
      );
    });

    it("trims surrounding whitespace", () => {
      expect(gen({}, "  Hi  ")).toBe(`${IMPORT}\n\n<Badge>Hi</Badge>\n`);
    });

    it("treats empty children as no children", () => {
      expect(gen({ variant: "outline" }, "   ")).toContain(`<Badge variant="outline" />`);
    });
  });

  describe("wrapping", () => {
    it("stays on one line while it fits", () => {
      expect(gen({ variant: "outline" }, "Hi").split("\n").filter(Boolean)).toHaveLength(2);
    });

    it("breaks to one prop per line when too wide", () => {
      const out = gen({ variant: "outline", size: "lg", loading: true }, "A fairly long label here");
      expect(out).toBe(
        `${IMPORT}\n\n<Badge\n  variant="outline"\n  size="lg"\n  loading\n>\n  A fairly long label here\n</Badge>\n`,
      );
    });

    it("keeps a self-closing element inline while it fits", () => {
      const out = generateJsx({
        tag: "SomewhatLongComponentName",
        props: { variant: "outline", size: "lg" },
        rows,
      });
      expect(out).toContain(`<SomewhatLongComponentName variant="outline" size="lg" />`);
    });

    it("breaks a self-closing element once it doesn't", () => {
      const out = generateJsx({
        tag: "SomewhatLongComponentName",
        props: { variant: "outline", size: "lg", loading: true, label: "Save" },
        rows,
      });
      expect(out).toContain(`\n  variant="outline"\n`);
      expect(out.trimEnd().endsWith("/>")).toBe(true);
    });

    it("respects an explicit maxWidth", () => {
      const out = generateJsx({
        tag: "Badge",
        props: { variant: "outline" },
        rows,
        children: "Hi",
        maxWidth: 10,
      });
      expect(out.split("\n").length).toBeGreaterThan(4);
    });
  });

  describe("fixtures — multi-line element children", () => {
    const fixture = `<Alert.Title>Heads up</Alert.Title>
<Alert.Description>
  Something happened.
</Alert.Description>`;

    it("indents the fixture under its parent and never inlines it", () => {
      expect(generateJsx({ tag: "Alert", props: {}, rows: [], children: fixture })).toBe(
        `import { Alert } from "astralis-ui";\n\n` +
          `<Alert>\n` +
          `  <Alert.Title>Heads up</Alert.Title>\n` +
          `  <Alert.Description>\n` +
          `    Something happened.\n` +
          `  </Alert.Description>\n` +
          `</Alert>\n`,
      );
    });

    it("stays block-form even when the fixture is short enough to fit", () => {
      const out = generateJsx({ tag: "X", props: {}, rows: [], children: "<A />\n<B />" });
      expect(out).toContain("<X>\n  <A />\n  <B />\n</X>");
    });

    it("keeps props on their own lines above a fixture", () => {
      const rows: PropRow[] = [
        { prop: "status", type: `"info" | "error"`, default: `"info"`, description: "" },
      ];
      const out = generateJsx({ tag: "Alert", props: { status: "error" }, rows, children: fixture });
      expect(out).toContain(`<Alert\n  status="error"\n>\n  <Alert.Title>`);
    });

    it("adds imports the fixture needs, sorted and de-duplicated", () => {
      expect(
        generateJsx({
          tag: "ButtonGroup",
          props: {},
          rows: [],
          children: "<Button>Go</Button>",
          imports: ["Button", "Button"],
        }),
      ).toContain(`import { Button, ButtonGroup } from "astralis-ui";`);
    });

    it("does not import compound parts separately — Alert.Title comes in on Alert", () => {
      const out = generateJsx({
        tag: "Alert",
        props: {},
        rows: [],
        children: fixture,
        imports: ["Alert.Title"],
      });
      expect(out.split("\n")[0]).toBe(`import { Alert } from "astralis-ui";`);
    });
  });

  describe("non-primitive props", () => {
    it("serializes an options array into a braced attribute", () => {
      const out = generateJsx({
        tag: "Select",
        props: { options: [{ value: "sm", label: "Small" }] },
        rows: [],
      });
      expect(out).toContain(`options={[{ value: "sm", label: "Small" }]}`);
    });

    it("indents a multi-line attribute under the tag", () => {
      const out = generateJsx({
        tag: "Select",
        props: {
          options: [
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
          ],
        },
        rows: [],
      });
      // A wide attribute forces block form even though nothing else would.
      expect(out).toBe(
        `import { Select } from "astralis-ui";\n\n` +
          `<Select\n` +
          `  options={[\n` +
          `    { value: "sm", label: "Small" },\n` +
          `    { value: "md", label: "Medium" },\n` +
          `  ]}\n` +
          `/>\n`,
      );
    });
  });

  it("points the import at a configurable package", () => {
    expect(generateJsx({ tag: "Badge", props: {}, rows, from: "@acme/ui" })).toContain(
      `from "@acme/ui"`,
    );
  });
});
