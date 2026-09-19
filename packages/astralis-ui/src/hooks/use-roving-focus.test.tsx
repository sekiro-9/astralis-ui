import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRovingFocus } from "./use-roving-focus";

function List({
  orientation,
  loop,
  typeahead,
}: {
  orientation?: "vertical" | "horizontal" | "both";
  loop?: boolean;
  typeahead?: boolean;
}) {
  const roving = useRovingFocus<HTMLDivElement>({ itemSelector: "[data-item]", orientation, loop, typeahead });
  return (
    <div ref={roving.containerRef} onKeyDown={roving.onKeyDown}>
      <button data-item="">Apple</button>
      <button data-item="" disabled>
        Banana
      </button>
      <button data-item="" aria-disabled="true">
        Blueberry
      </button>
      <button data-item="">Cherry</button>
      <button data-item="">Date</button>
    </div>
  );
}

const item = (name: string) => screen.getByText(name);

describe("useRovingFocus", () => {
  it("vertical arrows move focus, skip disabled items and wrap", async () => {
    const user = userEvent.setup();
    render(<List />);
    item("Apple").focus();

    await user.keyboard("{ArrowDown}");
    expect(item("Cherry")).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(item("Date")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(item("Date")).toHaveFocus(); // horizontal keys are ignored
  });

  it("Home and End jump to the ends", async () => {
    const user = userEvent.setup();
    render(<List />);
    item("Cherry").focus();

    await user.keyboard("{End}");
    expect(item("Date")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(item("Apple")).toHaveFocus();
  });

  it("loop={false} stops at the ends", async () => {
    const user = userEvent.setup();
    render(<List loop={false} />);
    item("Date").focus();

    await user.keyboard("{ArrowDown}");
    expect(item("Date")).toHaveFocus();
  });

  it("horizontal orientation uses left and right", async () => {
    const user = userEvent.setup();
    render(<List orientation="horizontal" />);
    item("Apple").focus();

    await user.keyboard("{ArrowRight}");
    expect(item("Cherry")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(item("Cherry")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(item("Apple")).toHaveFocus();
  });

  it("typeahead jumps to the next item starting with the typed text", async () => {
    const user = userEvent.setup();
    render(<List typeahead />);
    item("Apple").focus();

    await user.keyboard("d");
    expect(item("Date")).toHaveFocus();
    await new Promise((r) => setTimeout(r, 550)); // buffer resets after a pause
    await user.keyboard("c");
    expect(item("Cherry")).toHaveFocus();
  });
});
