import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar } from "./index";

describe("Avatar", () => {
  it("retries the image when src changes after a failure", () => {
    const { container, rerender } = render(<Avatar src="/broken.png" name="Ada Lovelace" />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    rerender(<Avatar src="/fixed.png" name="Ada Lovelace" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/fixed.png");
  });

  it("names the initials fallback as an image", () => {
    render(<Avatar name="Ada Lovelace" />);
    const avatar = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(avatar).toHaveTextContent("AL");
  });

  it("leaves the naming to the <img> while the photo shows", () => {
    const { container } = render(<Avatar src="/a.png" name="Ada" />);
    expect(container.firstElementChild).not.toHaveAttribute("role");
    expect(screen.getByRole("img", { name: "Ada" }).tagName).toBe("IMG");
  });

  it("keeps the caller's style alongside placement props", () => {
    const { container } = render(<Avatar name="A B" mt="2" style={{ opacity: 0.5 }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe("0.5");
    expect(root.style.getPropertyValue("--astralis-mt")).toBe("var(--astralis-spacing-2)");
  });

  it("collapses a group past max into a +N chip and sizes its members", () => {
    const { container } = render(
      <Avatar.Group max={2} size="lg">
        <Avatar name="A A" />
        <Avatar name="B B" />
        <Avatar name="C C" />
      </Avatar.Group>,
    );
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(container.textContent).toContain("+1");
    expect(screen.getAllByRole("img")[0].className).toMatch(/astralis:size-12/);
  });
});
