import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Editable } from "./index";
import { ScrollArea } from "../../layout/scroll-area";

describe("Editable", () => {
  function Fixture(props: { onSubmit?: (v: string) => void; onCancel?: () => void }) {
    return (
      <Editable defaultValue="Untitled" {...props}>
        <Editable.Preview />
        <Editable.Input aria-label="Title" />
      </Editable>
    );
  }

  it("shows a button-role preview that swaps to a selected input on click", () => {
    const { container, getByText } = render(<Fixture />);
    const preview = getByText("Untitled");
    expect(preview.getAttribute("role")).toBe("button");
    expect(container.querySelector("input")).toBeNull();
    fireEvent.click(preview);
    const input = container.querySelector("input")!;
    expect(input.value).toBe("Untitled");
    expect(document.activeElement).toBe(input);
  });

  it("Enter commits the draft, Escape restores the previous value", () => {
    const onSubmit = vi.fn();
    const { container, getByText } = render(<Fixture onSubmit={onSubmit} />);
    fireEvent.click(getByText("Untitled"));
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "Roadmap" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("Roadmap");
    expect(getByText("Roadmap")).not.toBeNull();

    fireEvent.click(getByText("Roadmap"));
    const input2 = container.querySelector("input")!;
    fireEvent.change(input2, { target: { value: "scrapped" } });
    fireEvent.keyDown(input2, { key: "Escape" });
    expect(getByText("Roadmap")).not.toBeNull();
  });
});

describe("ScrollArea", () => {
  it("applies the overflow axis and themed-scrollbar classes", () => {
    const { container, rerender } = render(<ScrollArea>long content</ScrollArea>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("astralis:overflow-y-auto");
    expect(el.className).toContain("astralis:[&::-webkit-scrollbar]:size-2");
    rerender(<ScrollArea direction="horizontal" hideScrollbar>long content</ScrollArea>);
    const el2 = container.firstElementChild as HTMLElement;
    expect(el2.className).toContain("astralis:overflow-x-auto");
    expect(el2.className).toContain("astralis:[scrollbar-width:none]");
  });
});
