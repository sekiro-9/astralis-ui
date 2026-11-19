import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker } from "./index";
import { Field } from "../field";
import { formatValue, toFormValue, toIsoDate } from "./date-picker.utils";

const MARCH_2026 = new Date(2026, 2, 1);
const day = (d: number) => screen.getByRole("button", { name: new RegExp(`March ${d}, 2026`) });
const field = () => screen.getByRole("button", { name: /pick a date|mar \d+, 2026/i });

describe("DatePicker", () => {
  it("shows the placeholder, then the picked date, and closes on a pick", () => {
    const onValueChange = vi.fn();
    render(<DatePicker defaultMonth={MARCH_2026} onValueChange={onValueChange} />);
    expect(field()).toHaveTextContent("Pick a date");
    expect(field()).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(field());
    expect(field()).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(day(8));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(toIsoDate(onValueChange.mock.calls[0][0])).toBe("2026-03-08");
    expect(field()).toHaveTextContent("Mar 8, 2026");
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("is controlled when given a value", () => {
    const onValueChange = vi.fn();
    render(<DatePicker value={new Date(2026, 2, 8)} onValueChange={onValueChange} defaultOpen />);
    fireEvent.click(day(12));
    expect(toIsoDate(onValueChange.mock.calls[0][0])).toBe("2026-03-12");
    expect(field()).toHaveTextContent("Mar 8, 2026");
  });

  it("picks a range in two clicks and stays open until the end is chosen", () => {
    const onValueChange = vi.fn();
    render(<DatePicker selectionMode="range" defaultMonth={MARCH_2026} onValueChange={onValueChange} defaultOpen />);
    const trigger = screen.getByRole("button", { name: /pick a date range/i });

    fireEvent.click(day(8));
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveTextContent("Mar 8, 2026 – …");

    fireEvent.click(day(12));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("Mar 8, 2026 – Mar 12, 2026");
    const last = onValueChange.mock.calls.at(-1)![0];
    expect([toIsoDate(last.start), toIsoDate(last.end)]).toEqual(["2026-03-08", "2026-03-12"]);
  });

  it("clears from the calendar, and offers no Clear when clearable is off", () => {
    const onValueChange = vi.fn();
    const { unmount } = render(<DatePicker defaultValue={new Date(2026, 2, 8)} onValueChange={onValueChange} defaultOpen />);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(field()).toHaveTextContent("Pick a date");
    unmount();

    render(<DatePicker defaultValue={new Date(2026, 2, 8)} clearable={false} defaultOpen />);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("submits an ISO date under its name", () => {
    const { container } = render(<DatePicker name="due" defaultValue={new Date(2026, 2, 8)} />);
    expect(container.ownerDocument.querySelector('input[type="hidden"][name="due"]')).toHaveValue("2026-03-08");
  });

  it("writes the date in the given locale and format", () => {
    render(<DatePicker defaultValue={new Date(2026, 2, 8)} locale="en-GB" formatOptions={{ dateStyle: "long" }} />);
    expect(screen.getByRole("button", { name: "8 March 2026" })).toBeInTheDocument();
  });

  it("does not open when disabled, and marks itself invalid", () => {
    render(<DatePicker disabled invalid />);
    const trigger = field();
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("takes its id, invalid and disabled from a Field", () => {
    render(
      <Field invalid>
        <Field.Label>Due date</Field.Label>
        <DatePicker />
      </Field>,
    );
    const trigger = screen.getByLabelText("Due date");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveTextContent("Pick a date");
  });

  it("keeps dates outside minDate and maxDate unpickable", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker defaultMonth={MARCH_2026} minDate={new Date(2026, 2, 10)} maxDate={new Date(2026, 2, 20)} onValueChange={onValueChange} defaultOpen />,
    );
    fireEvent.click(day(5));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(day(15));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
});

describe("date-picker utils", () => {
  it("formats the form value without time zones", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toFormValue(null)).toBe("");
    expect(toFormValue({ start: new Date(2026, 2, 8), end: null })).toBe("");
    expect(toFormValue({ start: new Date(2026, 2, 8), end: new Date(2026, 2, 12) })).toBe("2026-03-08/2026-03-12");
  });

  it("formats the shown text", () => {
    const options = { dateStyle: "medium" } as const;
    expect(formatValue(null, "en-US", options)).toBeNull();
    expect(formatValue({ start: null, end: null }, "en-US", options)).toBeNull();
    expect(formatValue(new Date(2026, 2, 8), "en-US", options)).toBe("Mar 8, 2026");
  });
});
