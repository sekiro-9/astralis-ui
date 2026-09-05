import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PinInput } from "./index";
import { Field } from "../field";

const cells = () => screen.getAllByRole("textbox") as HTMLInputElement[];
const values = () => cells().map((c) => c.value);

describe("PinInput typing", () => {
  it("fills cell by cell, advancing focus, and completes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onComplete = vi.fn();
    render(<PinInput type="alphanumeric" onValueChange={onValueChange} onComplete={onComplete} />);
    await user.click(cells()[0]);
    await user.keyboard("a1b2");
    expect(values()).toEqual(["a", "1", "b", "2"]);
    expect(onValueChange).toHaveBeenLastCalledWith("a1b2");
    expect(onComplete).toHaveBeenCalledWith("a1b2");
  });

  it("rejects characters the type does not allow", async () => {
    const user = userEvent.setup();
    render(<PinInput type="alpha" />);
    await user.click(cells()[0]);
    await user.keyboard("7");
    expect(values()[0]).toBe("");
  });

  it("backspace on an empty cell clears the previous one and moves back", async () => {
    const user = userEvent.setup();
    render(<PinInput type="alphanumeric" defaultValue="ab" />);
    await user.click(cells()[2]);
    await user.keyboard("{Backspace}");
    expect(values()).toEqual(["a", "", "", ""]);
    expect(document.activeElement).toBe(cells()[1]);
  });

  it("keeps the deprecated onChange firing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PinInput onChange={onChange} />);
    await user.click(cells()[0]);
    await user.keyboard("4");
    expect(onChange).toHaveBeenCalledWith("4");
  });
});

describe("PinInput multi-character entry", () => {
  it("spreads a one-time-code autofill across every cell", () => {
    const onComplete = vi.fn();
    render(<PinInput length={6} onComplete={onComplete} />);
    fireEvent.change(cells()[0], { target: { value: "482913" } });
    expect(values()).toEqual(["4", "8", "2", "9", "1", "3"]);
    expect(onComplete).toHaveBeenCalledWith("482913");
  });

  it("filters a paste to the allowed characters and focuses after the last filled cell", () => {
    render(<PinInput />);
    fireEvent.paste(cells()[1], { clipboardData: { getData: () => "12-3" } });
    expect(values()).toEqual(["1", "2", "3", ""]);
    expect(document.activeElement).toBe(cells()[3]);
  });

  it("types over a filled cell whose text is not selected", () => {
    render(<PinInput defaultValue="1" />);
    fireEvent.change(cells()[0], { target: { value: "15" } });
    expect(values()[0]).toBe("5");
  });
});

describe("PinInput labelling and chrome", () => {
  it("is named by Field.Label, and by aria-label outside a Field", () => {
    const { unmount } = render(
      <Field id="otp">
        <Field.Label>Verification code</Field.Label>
        <PinInput />
      </Field>,
    );
    expect(screen.getByRole("group", { name: "Verification code" })).toBeInTheDocument();
    expect(cells()[0]).toHaveAttribute("id", "otp");
    unmount();

    render(<PinInput aria-label="Card PIN" />);
    expect(screen.getByRole("group", { name: "Card PIN" })).toBeInTheDocument();
  });

  it("takes the whole Input variant set and a colorScheme", () => {
    render(<PinInput variant="underline" colorScheme="green" />);
    expect(screen.getByRole("group")).toHaveClass("astralis-accent-green");
    expect(cells()[0].className).toMatch(/astralis:border-b-2/);
  });
});
