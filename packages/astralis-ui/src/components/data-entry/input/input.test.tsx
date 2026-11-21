import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./index";

describe("Input.Search", () => {
  it("submits the typed value from the button even when given a callback ref", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    let node: HTMLInputElement | null = null;
    render(
      <Input.Search
        showSearchButton
        onSearch={onSearch}
        ref={(el) => {
          node = el;
        }}
      />,
    );
    await user.type(screen.getByRole("searchbox"), "tokens");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(onSearch).toHaveBeenCalledWith("tokens");
    expect(node).toBe(screen.getByRole("searchbox"));
  });

  it("submits on Enter", () => {
    const onSearch = vi.fn();
    render(<Input.Search onSearch={onSearch} defaultValue="x" />);
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Enter" });
    expect(onSearch).toHaveBeenCalledWith("x");
  });
});

describe("Input.Password", () => {
  it("lets the keyboard reach the reveal toggle", async () => {
    const user = userEvent.setup();
    const { container } = render(<Input.Password aria-label="Password" />);
    await user.tab();
    await user.tab();
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(document.activeElement).toBe(toggle);
    await user.keyboard("{Enter}");
    expect(container.querySelector("input")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });
});

describe.each([
  ["Input.Password", Input.Password],
  ["Input.Search", Input.Search],
])("%s placement", (_name, Component) => {
  it("places the wrapper and leaves the input's own className and style on the input", () => {
    const { container } = render(
      <Component aria-label="x" w="40" position="absolute" className="custom" style={{ letterSpacing: "1px" }} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    const input = container.querySelector("input")!;

    expect(wrapper).toHaveClass("astralis:absolute", "astralis-w");
    expect(wrapper.style.getPropertyValue("--astralis-w")).toBe("var(--astralis-size-40)");
    expect(input).not.toHaveClass("astralis-w");
    expect(input).not.toHaveClass("astralis:absolute");
    expect(input.style.getPropertyValue("--astralis-w")).toBe("");
    expect(input).toHaveClass("custom");
    expect(input.style.letterSpacing).toBe("1px");
  });
});

describe("Input rounded", () => {
  const radii = (el: Element) => [...el.classList].filter((c) => /^astralis:rounded/.test(c));

  it("keeps each variant's own corners when unset", () => {
    const { rerender } = render(<Input aria-label="a" />);
    expect(radii(screen.getByRole("textbox"))).toEqual(["astralis:rounded-lg"]);
    rerender(<Input aria-label="a" variant="filled" />);
    expect(radii(screen.getByRole("textbox"))).toEqual(["astralis:rounded-lg"]);
    rerender(<Input aria-label="a" variant="underline" />);
    expect(radii(screen.getByRole("textbox"))).toEqual(["astralis:rounded-none"]);
  });

  it("replaces the variant's radius with the one asked for", () => {
    render(<Input aria-label="a" rounded="full" />);
    expect(radii(screen.getByRole("textbox"))).toEqual(["astralis:rounded-full"]);
  });

  it("reaches the input inside Input.Password", () => {
    const { container } = render(<Input.Password aria-label="p" rounded="full" />);
    expect(radii(container.querySelector("input")!)).toEqual(["astralis:rounded-full"]);
  });

  it("squares Input.Search's joined corners and rounds its button to match", () => {
    render(<Input.Search aria-label="s" rounded="full" showSearchButton />);
    expect(radii(screen.getByRole("searchbox"))).toEqual(["astralis:rounded-full", "astralis:rounded-r-none"]);
    expect(radii(screen.getByRole("button", { name: "Search" }))).toEqual(["astralis:rounded-r-full"]);
  });

  it("gives Input.Search's button the default corners when unset", () => {
    render(<Input.Search aria-label="s" showSearchButton />);
    expect(radii(screen.getByRole("searchbox"))).toEqual(["astralis:rounded-lg", "astralis:rounded-r-none"]);
    expect(radii(screen.getByRole("button", { name: "Search" }))).toEqual(["astralis:rounded-r-lg"]);
  });
});

describe("Input colorScheme", () => {
  it("scopes the accent channel only when a scheme is given", () => {
    const { rerender } = render(<Input aria-label="a" />);
    expect(screen.getByRole("textbox").className).not.toMatch(/astralis-accent-/);
    rerender(<Input aria-label="a" colorScheme="green" />);
    expect(screen.getByRole("textbox")).toHaveClass("astralis-accent-green");
    rerender(<Input.TextArea aria-label="a" colorScheme="red" />);
    expect(screen.getByRole("textbox")).toHaveClass("astralis-accent-red");
  });
});
