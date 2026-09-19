import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Pagination } from "./index";
import type { PaginationProps } from "./pagination.types";

function Fixture(props: Partial<PaginationProps>) {
  return (
    <Pagination totalPages={10} {...props}>
      <Pagination.List>
        <Pagination.Prev />
        <Pagination.Pages />
        <Pagination.Next />
        <Pagination.PageText />
      </Pagination.List>
    </Pagination>
  );
}

describe("Pagination", () => {
  it("clamps an uncontrolled page when totalPages shrinks", () => {
    const { rerender } = render(<Fixture defaultPage={10} />);
    expect(screen.getByText("Page 10 of 10")).toBeInTheDocument();
    rerender(<Fixture defaultPage={10} totalPages={3} />);
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 3" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("steps with Prev and Next and reports the page", () => {
    const onPageChange = vi.fn();
    render(<Fixture defaultPage={2} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  it("collapses long ranges with ellipses around the current page", () => {
    render(<Fixture defaultPage={5} totalPages={20} />);
    const pages = screen.getAllByRole("button", { name: /Go to page/ }).map((b) => b.textContent);
    expect(pages).toEqual(["1", "4", "5", "6", "20"]);
  });

  it("derives the page count from count and pageSize", () => {
    render(
      <Pagination count={45} pageSize={10}>
        <Pagination.List>
          <Pagination.PageText />
        </Pagination.List>
      </Pagination>,
    );
    expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
  });

  it("does nothing while disabled", () => {
    const onPageChange = vi.fn();
    render(<Fixture disabled onPageChange={onPageChange} />);
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("jumps to a typed page on Enter, clamped to the range", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination totalPages={8} onPageChange={onPageChange}>
        <Pagination.List>
          <Pagination.Jumper />
        </Pagination.List>
      </Pagination>,
    );
    const input = screen.getByRole("spinbutton", { name: "Jump to page" });
    fireEvent.change(input, { target: { value: "42" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onPageChange).toHaveBeenCalledWith(8);
  });
});
