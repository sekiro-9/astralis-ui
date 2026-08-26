import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { HoverCard } from "./index";

function Fixture() {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCard.Trigger>
        <a href="#u">@paul</a>
      </HoverCard.Trigger>
      <HoverCard.Content>
        <p>Paul Andrew — building Astralis.</p>
      </HoverCard.Content>
    </HoverCard>
  );
}

describe("HoverCard", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("opens after openDelay on hover, not immediately", () => {
    const { getByText, baseElement } = render(<Fixture />);
    fireEvent.mouseEnter(getByText("@paul"));
    expect(baseElement.textContent).not.toContain("building Astralis");
    act(() => vi.advanceTimersByTime(120));
    expect(baseElement.textContent).toContain("building Astralis");
  });

  it("entering the card within closeDelay cancels the close — content is interactive", () => {
    const { getByText, baseElement } = render(<Fixture />);
    fireEvent.mouseEnter(getByText("@paul"));
    act(() => vi.advanceTimersByTime(120));
    const card = baseElement.querySelector("[data-side]")!;
    fireEvent.mouseLeave(getByText("@paul"));
    act(() => vi.advanceTimersByTime(50));
    fireEvent.mouseEnter(card);
    act(() => vi.advanceTimersByTime(300));
    expect(baseElement.textContent).toContain("building Astralis");
  });

  it("keyboard focus opens immediately and blur closes", () => {
    const { getByText, baseElement } = render(<Fixture />);
    fireEvent.focus(getByText("@paul"));
    expect(baseElement.textContent).toContain("building Astralis");
    fireEvent.blur(getByText("@paul"));
    act(() => vi.advanceTimersByTime(300));
    expect(baseElement.querySelector('[data-side].astralis\\:opacity-100')).toBeNull();
  });
});
