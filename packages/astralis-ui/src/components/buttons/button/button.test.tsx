import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Button } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Button type", () => {
  it("defaults a native button to type=button", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("button");
  });

  it("does not submit a surrounding form", () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Cancel</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("lets an explicit type win", () => {
    render(<Button type="submit">Save</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
  });

  it("puts no type on a non-button element", () => {
    render(
      <Button as="a" href="/x">
        Link
      </Button>,
    );
    expect(screen.getByRole("link").hasAttribute("type")).toBe(false);
  });
});

describe("Button loading", () => {
  it("is aria-busy only while loading", () => {
    const { rerender } = render(<Button loading>Save</Button>);
    expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");

    rerender(<Button>Save</Button>);
    expect(screen.getByRole("button").hasAttribute("aria-busy")).toBe(false);
  });
});

describe("Button ref", () => {
  it("attaches to the rendered element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Go</Button>);
    expect(ref.current).toBe(screen.getByRole("button"));
  });
});

describe("Button icon-only warning", () => {
  it("warns once, not on every render", async () => {
    vi.resetModules();
    const { Button: FreshButton } = await import("./index");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { rerender } = render(<FreshButton leftIcon={<svg />} />);
    rerender(<FreshButton leftIcon={<svg />} size="lg" />);
    render(<FreshButton rightIcon={<svg />} />);

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("stays quiet when the button is named", async () => {
    vi.resetModules();
    const { Button: FreshButton } = await import("./index");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<FreshButton leftIcon={<svg />} aria-label="Close" />);
    expect(warn).not.toHaveBeenCalled();
  });
});
