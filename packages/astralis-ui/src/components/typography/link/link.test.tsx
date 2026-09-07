import { expect, it, describe } from "vitest";
import { render } from "@testing-library/react";
import { Link } from "./link";

const cls = (c: HTMLElement) => c.querySelector("a")!.className;

/**
 * Link composes Text's typography without Text's defaults. The two traps: a
 * bare link must emit no type classes so it inherits, and an explicit colour
 * must hold in BOTH states rather than being swapped on hover.
 */
describe("Link typography", () => {
  it("bare link emits no type classes, so it inherits", () => {
    const { container } = render(<Link href="#">x</Link>);
    expect(cls(container)).not.toMatch(/astralis:text-(xs|sm|md|lg)\b/);
    expect(cls(container)).toContain("astralis:text-accent-label");
    expect(cls(container)).toContain("astralis:hover:text-accent-solid");
  });
  it("takes Text props", () => {
    const { container } = render(<Link href="#" size="sm" weight="medium">x</Link>);
    expect(cls(container)).toContain("astralis:text-sm");
    expect(cls(container)).toContain("astralis:font-medium");
  });
  it("explicit color wins and drops the hover shift", () => {
    const { container } = render(<Link href="#" color="inverted">x</Link>);
    const a = container.querySelector("a")!;
    // color is a channel prop; the resting accent class must step aside
    // entirely (a utility-layer class would beat the channel var in cascade).
    expect(cls(container)).toContain("astralis-color");
    expect(a.style.getPropertyValue("--astralis-color")).toBe(
      "var(--astralis-color-label-inverted)",
    );
    expect(cls(container)).not.toContain("astralis:text-accent-label");
    expect(cls(container)).not.toContain("astralis:hover:text-accent-solid");
  });
  it("color is no longer a stray DOM attribute", () => {
    const { container } = render(<Link href="#" color="inverted">x</Link>);
    expect(container.querySelector("a")!.hasAttribute("color")).toBe(false);
  });
  it("responsive size works", () => {
    const { container } = render(<Link href="#" size={{ base: "sm", lg: "md" }}>x</Link>);
    expect(cls(container)).toContain("astralis:text-sm");
    expect(cls(container)).toContain("astralis:lg:text-md");
  });
});

describe("Link external", () => {
  it("opens in a new tab safely and says so to screen readers", () => {
    const { getByRole } = render(<Link href="https://x.dev" external>Docs</Link>);
    const a = getByRole("link");

    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(a.textContent).toContain("(opens in new tab)");
    expect(getByRole("link", { name: /Docs.*opens in new tab/ })).toBe(a);
  });

  it("takes a translated label", () => {
    const { getByRole } = render(
      <Link href="https://x.dev" external externalLabel="(nouvel onglet)">Docs</Link>,
    );
    expect(getByRole("link").textContent).toContain("(nouvel onglet)");
  });

  it("adds nothing to an internal link", () => {
    const { getByRole } = render(<Link href="/docs">Docs</Link>);
    expect(getByRole("link").textContent).toBe("Docs");
  });
});
