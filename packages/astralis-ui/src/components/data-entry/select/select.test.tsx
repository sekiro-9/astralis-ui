import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "./index";
import { Modal } from "../../overlay/modal";
import { Popover } from "../../overlay/popover";

const OPTIONS = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry", disabled: true },
  { label: "Dragon fruit", value: "dragon fruit" },
];

const trigger = () => screen.getByRole("combobox");
const listbox = () => screen.getByRole("listbox");

describe("Select selection", () => {
  it("clicking an option selects it, fires onValueChange and the deprecated onChange, and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(<Select aria-label="Fruit" options={OPTIONS} onValueChange={onValueChange} onChange={onChange} />);

    await user.click(trigger());
    await user.click(screen.getByRole("option", { name: "Banana" }));

    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(onChange).toHaveBeenCalledWith("banana");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger()).toHaveTextContent("Banana");
    expect(trigger()).toHaveFocus();
  });

  it("controlled value wins until the parent changes it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select aria-label="Fruit" options={OPTIONS} value="apple" onValueChange={onValueChange} />);

    await user.click(trigger());
    await user.click(screen.getByRole("option", { name: "Banana" }));
    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(trigger()).toHaveTextContent("Apple");
  });
});

describe("Select keyboard and ARIA", () => {
  it("arrows move the active option, announced through aria-activedescendant, and Enter picks it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select aria-label="Fruit" options={OPTIONS} onValueChange={onValueChange} />);

    trigger().focus();
    await user.keyboard("{ArrowDown}");
    expect(trigger()).toHaveAttribute("aria-controls", listbox().id);
    expect(trigger()).not.toHaveAttribute("aria-activedescendant");

    await user.keyboard("{ArrowDown}{ArrowDown}");
    const active = trigger().getAttribute("aria-activedescendant")!;
    expect(document.getElementById(active)).toHaveTextContent("Banana");

    await user.keyboard("{ArrowDown}"); // skips the disabled Cherry
    // A value with a space still yields a valid, resolvable id.
    expect(document.getElementById(trigger().getAttribute("aria-activedescendant")!)).toHaveTextContent("Dragon fruit");

    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("dragon fruit");
  });

  it("opens on the current selection", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Fruit" options={OPTIONS} defaultValue="banana" />);
    trigger().focus();
    await user.keyboard("{Enter}");
    expect(document.getElementById(trigger().getAttribute("aria-activedescendant")!)).toHaveTextContent("Banana");
  });

  it("the listbox is named by the trigger", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Fruit" options={OPTIONS} />);
    await user.click(trigger());
    expect(listbox()).toHaveAttribute("aria-labelledby", trigger().id);
  });
});

describe("Select search", () => {
  it("the search input takes spaces and filters by searchLabel for JSX labels", async () => {
    const user = userEvent.setup();
    render(
      <Select
        aria-label="Fruit"
        searchable
        options={[
          ...OPTIONS,
          { label: <strong>Star fruit</strong>, value: "star" },
          { label: <span>🍋</span>, searchLabel: "lemon yellow", value: "lemon" },
        ]}
      />,
    );

    await user.click(trigger());
    const search = screen.getByRole("textbox", { name: "Search options" });
    await waitFor(() => expect(search).toHaveFocus());

    await user.keyboard("n fr");
    expect(search).toHaveValue("n fr");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Dragon fruit"]);

    await user.clear(search);
    await user.keyboard("star");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Star fruit"]);

    await user.clear(search);
    await user.keyboard("lemon yel");
    expect(screen.getAllByRole("option")).toHaveLength(1);

    await user.keyboard("{ArrowDown}");
    expect(search).toHaveAttribute("aria-activedescendant", screen.getByRole("option").id);
  });
});

describe("Select clear button", () => {
  it("is a real button outside the trigger, reachable by keyboard", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<Select aria-label="Fruit" options={OPTIONS} defaultValue="apple" clearable onClear={onClear} />);

    const clear = screen.getByRole("button", { name: "Clear selection" });
    expect(trigger().contains(clear)).toBe(false);

    trigger().focus();
    await user.tab();
    expect(clear).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(onClear).toHaveBeenCalled();
    expect(trigger()).toHaveTextContent("Select an option");
    expect(trigger()).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Clear selection" })).toBeNull();
  });
});

describe("Select inside overlays", () => {
  it("Escape closes the listbox only, not the Modal around it", async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen>
        <Modal.Content>
          <Modal.Title>Pick</Modal.Title>
          <Select aria-label="Fruit" options={OPTIONS} />
        </Modal.Content>
      </Modal>,
    );

    await waitFor(() => expect(trigger()).toHaveFocus());
    await user.keyboard("{ArrowDown}");
    expect(listbox()).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(trigger()).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("choosing an option inside a Popover keeps the Popover open", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Filters</button>
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Filters</Popover.Title>
          <Select aria-label="Fruit" options={OPTIONS} onValueChange={onValueChange} />
        </Popover.Content>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Filters" }));
    await user.click(await screen.findByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Apple" }));

    expect(onValueChange).toHaveBeenCalledWith("apple");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("a press outside closes the listbox", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select aria-label="Fruit" options={OPTIONS} />
        <button>elsewhere</button>
      </>,
    );
    await user.click(trigger());
    await user.click(screen.getByText("elsewhere"));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("Select variants and placement", () => {
  it("underline and unstyled variants render", () => {
    const { rerender } = render(<Select aria-label="Fruit" options={OPTIONS} variant="underline" />);
    expect(trigger().className).toContain("astralis:border-b-2");
    rerender(<Select aria-label="Fruit" options={OPTIONS} variant="unstyled" />);
    expect(trigger().className).toContain("astralis:bg-transparent");
  });

  it("placement vars land on the wrapper that carries the placement class; style stays on the trigger", () => {
    const { container } = render(<Select aria-label="Fruit" options={OPTIONS} w="md" style={{ color: "red" }} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains("astralis-w")).toBe(true);
    expect(wrapper.style.getPropertyValue("--astralis-w")).not.toBe("");
    expect(trigger().style.getPropertyValue("--astralis-w")).toBe("");
    expect(trigger().style.color).toBe("red");
  });
});
