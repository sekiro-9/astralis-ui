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
