import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Icon } from "./index";

const svg = <svg viewBox="0 0 24 24" />;
const root = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe("Icon size", () => {
  it("keeps a token on its class and a number on inline width and height", () => {
    const token = render(<Icon size="lg">{svg}</Icon>);
    expect(root(token.container)).toHaveClass("astralis:size-8");
    expect(root(token.container).getAttribute("style")).toBeNull();

    const number = render(<Icon size={18}>{svg}</Icon>);
    expect(root(number.container).style.width).toBe("18px");
    expect(root(number.container).style.height).toBe("18px");

    const unset = render(<Icon>{svg}</Icon>);
    expect(root(unset.container)).toHaveClass("astralis:size-6");
  });

  it("takes a responsive map of tokens and numbers on the size channel", () => {
    const { container } = render(<Icon size={{ base: "sm", md: 28, lg: "xl" }}>{svg}</Icon>);
    const el = root(container);

    expect(el).toHaveClass("astralis-size", "astralis-size-md", "astralis-size-lg");
    expect(el.style.getPropertyValue("--astralis-size")).toBe("var(--astralis-size-5)");
    expect(el.style.getPropertyValue("--astralis-size-md")).toBe("28px");
    expect(el.style.getPropertyValue("--astralis-size-lg")).toBe("var(--astralis-size-10)");
    expect([...el.classList].some((c) => c.startsWith("astralis:size-"))).toBe(false);
    expect(el.style.width).toBe("");
  });

  it("starts a map without base from the default md", () => {
    const { container } = render(<Icon size={{ lg: "lg" }}>{svg}</Icon>);
    const el = root(container);

    expect(el.style.getPropertyValue("--astralis-size")).toBe("var(--astralis-size-6)");
    expect(el.style.getPropertyValue("--astralis-size-lg")).toBe("var(--astralis-size-8)");
  });

  it("lets the caller's style win over a responsive size", () => {
    const { container } = render(<Icon size={{ base: "sm" }} style={{ width: "3px" }}>{svg}</Icon>);
    expect(root(container).style.width).toBe("3px");
  });
});
