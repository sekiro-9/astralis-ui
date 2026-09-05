import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { Editable } from "./index";
import { Field } from "../field";
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

describe("Editable API and Field", () => {
  it("fires onValueChange and the deprecated onChange only when a commit changes the value", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <Editable defaultValue="Draft" onValueChange={onValueChange} onChange={onChange}>
        <Editable.Preview />
        <Editable.Input aria-label="Title" />
      </Editable>,
    );
    fireEvent.click(screen.getByText("Draft"));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Draft"));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Final" } });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("Final");
    expect(onChange).toHaveBeenCalledWith("Final");
  });

  it("locks when its Field is disabled or read-only", () => {
    const { rerender } = render(
      <Field disabled>
        <Editable defaultValue="Locked">
          <Editable.Preview />
          <Editable.Input />
        </Editable>
      </Field>,
    );
    fireEvent.click(screen.getByText("Locked"));
    expect(screen.queryByRole("textbox")).toBeNull();
    rerender(
      <Field readOnly>
        <Editable defaultValue="Locked">
          <Editable.Preview />
          <Editable.Input />
        </Editable>
      </Field>,
    );
    fireEvent.click(screen.getByText("Locked"));
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("labels, describes and marks the input invalid from Field while editing", () => {
    render(
      <Field id="title" invalid>
        <Field.Label>Title</Field.Label>
        <Editable defaultValue="x" startWithEditView>
          <Editable.Preview />
          <Editable.Input />
        </Editable>
        <Field.ErrorText>Too short</Field.ErrorText>
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Title" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "title-error");
  });

  it("takes placement props and a colorScheme", () => {
    const { container } = render(
      <Editable mt="4" colorScheme="green" defaultValue="x">
        <Editable.Preview />
      </Editable>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList).toContain("astralis-mt");
    expect(root).toHaveClass("astralis-accent-green");
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
