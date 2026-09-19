import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Calendar } from "./index";

const MARCH_2026 = new Date(2026, 2, 1);
const day = (d: number) => screen.getByRole("button", { name: new RegExp(`March ${d}, 2026`) });

describe("Calendar grid semantics", () => {
  it("exposes a labelled grid of rows and gridcells with locale-aware day names", () => {
    render(<Calendar defaultMonth={MARCH_2026} defaultValue={new Date(2026, 2, 8)} />);
    const grid = screen.getByRole("grid", { name: "March 2026" });
    const rows = within(grid).getAllByRole("row");
    expect(rows).toHaveLength(6);
    expect(within(rows[0]).getAllByRole("gridcell")).toHaveLength(7);
    expect(day(8).closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "Sunday, March 8, 2026" })).toBeInTheDocument();
  });

  it("names days in the calendar's locale", () => {
    render(<Calendar defaultMonth={MARCH_2026} locale="fr-FR" />);
    expect(screen.getByRole("grid", { name: "mars 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "dimanche 8 mars 2026" })).toBeInTheDocument();
  });
});

describe("Calendar keyboard", () => {
  it("moves by day and week, and pages months", () => {
    render(<Calendar defaultMonth={MARCH_2026} defaultValue={new Date(2026, 2, 10)} />);
    const start = day(10);
    expect(start).toHaveAttribute("tabindex", "0");
    start.focus();
    fireEvent.keyDown(start, { key: "ArrowRight" });
    expect(document.activeElement).toBe(day(11));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(day(18));
    fireEvent.keyDown(document.activeElement!, { key: "PageDown" });
    expect(screen.getByRole("grid", { name: "April 2026" })).toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName(/April 18, 2026/);
  });

  it("steps over disabled days instead of landing focus on them", () => {
    render(
      <Calendar
        defaultMonth={MARCH_2026}
        defaultValue={new Date(2026, 2, 10)}
        isDateUnavailable={(d) => d.getDate() === 11 || d.getDate() === 12}
      />,
    );
    day(10).focus();
    fireEvent.keyDown(day(10), { key: "ArrowRight" });
    expect(document.activeElement).toBe(day(13));
    expect(day(13)).toHaveAttribute("tabindex", "0");
  });

  it("never makes a disabled day the tab stop", () => {
    render(<Calendar defaultMonth={MARCH_2026} minDate={new Date(2026, 2, 20)} />);
    const tabbable = screen.getAllByRole("button").filter((b) => b.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBeEnabled();
    expect(tabbable[0]).toHaveAccessibleName(/March 20, 2026/);
  });
});

describe("Calendar selection and color", () => {
  it("selects a range and reports it", () => {
    const onValueChange = vi.fn();
    render(<Calendar selectionMode="range" defaultMonth={MARCH_2026} onValueChange={onValueChange} />);
    fireEvent.click(day(5));
    fireEvent.click(day(9));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: new Date(2026, 2, 5), end: new Date(2026, 2, 9) });
    expect(day(7).className).toMatch(/astralis:bg-accent-subtle/);
  });

  it("treats a null value as a controlled empty selection", () => {
    render(<Calendar value={null} defaultValue={new Date(2026, 2, 8)} defaultMonth={MARCH_2026} />);
    fireEvent.click(day(9));
    expect(screen.queryAllByRole("gridcell").filter((c) => c.getAttribute("aria-selected") === "true")).toHaveLength(0);
  });

  it("paints selection from the accent channel scoped by colorScheme", () => {
    const { container } = render(<Calendar colorScheme="green" defaultMonth={MARCH_2026} defaultValue={new Date(2026, 2, 8)} />);
    expect(container.firstElementChild).toHaveClass("astralis-accent-green");
    expect(day(8).className).toMatch(/astralis:bg-accent-solid/);
  });
});
