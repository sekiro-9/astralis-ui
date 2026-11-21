import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Grid } from ".";
import { BREAKPOINTS } from "../../../const/breakpoints";

const root = (ui: React.ReactElement) => render(ui).container.firstElementChild as HTMLElement;

describe("Grid templates", () => {
  it("writes a plain string as inline style, with no class", () => {
    const el = root(<Grid templateColumns="minmax(0,1fr) 18rem" templateRows="auto 1fr" templateAreas={'"a b"'} />);
    expect(el.style.gridTemplateColumns).toBe("minmax(0,1fr) 18rem");
    expect(el.style.gridTemplateRows).toBe("auto 1fr");
    expect(el.style.gridTemplateAreas).toBe('"a b"');
    expect(el.className).not.toContain("astralis-template");
  });

  it("gives a breakpoint map one class and one variable per key", () => {
    const el = root(<Grid templateColumns={{ base: "1fr", lg: "minmax(0,1fr) 18rem" }} />);
    expect(el).toHaveClass("astralis-template-columns", "astralis-template-columns-lg");
    expect(el.style.getPropertyValue("--astralis-template-columns")).toBe("1fr");
    expect(el.style.getPropertyValue("--astralis-template-columns-lg")).toBe("minmax(0,1fr) 18rem");
    expect(el.style.gridTemplateColumns).toBe("");
  });

  it("takes container keys and skips unknown keys and empty values", () => {
    const el = root(
      <Grid
        templateRows={{ "@md": "auto 1fr", md: "" }}
        // @ts-expect-error not a breakpoint
        templateAreas={{ phone: '"a"' }}
      />,
    );
    expect(el).toHaveClass("astralis-template-rows-cq-md");
    expect(el.style.getPropertyValue("--astralis-template-rows-cq-md")).toBe("auto 1fr");
    expect(el.className).not.toMatch(/astralis-template-rows-md|astralis-template-areas/);
  });

  it("lets the caller's style win over a template", () => {
    const el = root(<Grid templateColumns="1fr" style={{ gridTemplateColumns: "2fr" }} />);
    expect(el.style.gridTemplateColumns).toBe("2fr");
  });

  it("has a rule for every template class it can emit", () => {
    const css = readFileSync(join(__dirname, "grid.css"), "utf8");
    for (const slug of ["template-columns", "template-rows", "template-areas"]) {
      for (const suffix of ["", ...BREAKPOINTS.map((bp) => `-${bp}`), ...BREAKPOINTS.map((bp) => `-cq-${bp}`)]) {
        expect(css).toContain(`.astralis-${slug}${suffix} {`);
        expect(css).toContain(`var(--astralis-${slug}${suffix})`);
      }
    }
  });
});
