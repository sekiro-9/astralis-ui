import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { TableOfContents } from "./index";

const ITEMS = [
  { id: "install", title: "Installation" },
  { id: "usage", title: "Usage", depth: 1 },
  { id: "api", title: "API" },
];

describe("TableOfContents", () => {
  it("renders a labelled nav of plain anchor links (works without JS)", () => {
    const { container } = render(<TableOfContents items={ITEMS} />);
    const nav = container.querySelector("nav")!;
    expect(nav.getAttribute("aria-label")).toBe("On this page");
    const links = [...nav.querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["#install", "#usage", "#api"]);
  });

  it("indents nested entries by depth", () => {
    const { container } = render(<TableOfContents items={ITEMS} />);
    const usage = [...container.querySelectorAll("a")].find((a) => a.textContent === "Usage")!;
    expect(usage.style.paddingLeft).toBe("1.5rem");
  });

  it("hides the visible heading when showLabel is false but keeps the aria-label", () => {
    const { container } = render(<TableOfContents items={ITEMS} label="Contents" showLabel={false} />);
    expect(container.textContent).not.toContain("Contents");
    expect(container.querySelector("nav")!.getAttribute("aria-label")).toBe("Contents");
  });
});
