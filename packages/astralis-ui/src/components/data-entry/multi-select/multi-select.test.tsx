import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelect } from "./index";
import { Field } from "../field";
import { Modal } from "../../overlay/modal";
import { Popover } from "../../overlay/popover";

const OPTIONS = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte", disabled: true },
  { label: <em>Solid</em>, value: "solid start" },
];

const combobox = () => screen.getByRole("combobox");
const listbox = () => screen.getByRole("listbox");

describe("MultiSelect selection", () => {
  it("clicking options toggles them; onValueChange and the deprecated onChange both fire", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(<MultiSelect aria-label="Frameworks" options={OPTIONS} onValueChange={onValueChange} onChange={onChange} />);

    await user.click(combobox());
    await user.click(screen.getByRole("option", { name: "React" }));
    await user.click(screen.getByRole("option", { name: "Vue" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["react", "vue"]);
    expect(onChange).toHaveBeenLastCalledWith(["react", "vue"]);
    expect(screen.getByRole("option", { name: "React" })).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("option", { name: "React" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["vue"]);
  });

  it("Backspace on an empty search removes the last tag, and tag buttons name their value", async () => {
    const user = userEvent.setup();
    render(<MultiSelect aria-label="Frameworks" options={OPTIONS} defaultValue={["react", "vue"]} />);

    expect(screen.getByRole("button", { name: "Remove React" })).toBeInTheDocument();
    combobox().focus();
    await user.keyboard("{Backspace}");
    expect(screen.queryByRole("button", { name: "Remove Vue" })).toBeNull();
    expect(screen.getByRole("button", { name: "Remove React" })).toBeInTheDocument();
  });

  it("max caps the selection and arrows skip the options it blocks", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<MultiSelect aria-label="Frameworks" options={OPTIONS} max={1} defaultValue={["vue"]} onValueChange={onValueChange} />);

    await user.click(combobox());
    expect(screen.getByRole("option", { name: "React" })).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{ArrowDown}");
    expect(document.getElementById(combobox().getAttribute("aria-activedescendant")!)).toHaveTextContent("Vue");
  });

  it("clear all is a keyboard-reachable button", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<MultiSelect aria-label="Frameworks" options={OPTIONS} defaultValue={["react"]} clearable onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });
});

describe("MultiSelect ARIA", () => {
  it("the focused input is the combobox, wired to the listbox and its active option", async () => {
    const user = userEvent.setup();
    render(<MultiSelect aria-label="Frameworks" options={OPTIONS} />);

    expect(combobox().tagName).toBe("INPUT");
    expect(combobox()).toHaveAccessibleName("Frameworks");
    await user.click(combobox());
    expect(combobox()).toHaveFocus();
    expect(combobox()).toHaveAttribute("aria-expanded", "true");
    expect(combobox()).toHaveAttribute("aria-controls", listbox().id);
    expect(listbox()).toHaveAttribute("aria-multiselectable", "true");

    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}"); // Svelte is disabled
    const active = document.getElementById(combobox().getAttribute("aria-activedescendant")!);
    expect(active).toHaveTextContent("Solid");

    await user.keyboard("{Enter}");
    expect(active).toHaveAttribute("aria-selected", "true");
  });

  it("a Field label names the combobox input", () => {
    render(
      <Field>
        <Field.Label>Stack</Field.Label>
        <MultiSelect options={OPTIONS} />
      </Field>,
    );
    expect(combobox()).toHaveAccessibleName("Stack");
  });

  it("JSX labels are searchable through their text", async () => {
    const user = userEvent.setup();
    render(<MultiSelect aria-label="Frameworks" options={OPTIONS} />);
    await user.click(combobox());
    await user.keyboard("sol");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Solid"]);
  });
});

describe("MultiSelect inside overlays", () => {
  it("Escape closes the listbox only, not the Modal around it", async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen>
        <Modal.Content>
          <Modal.Title>Pick</Modal.Title>
          <MultiSelect aria-label="Frameworks" options={OPTIONS} />
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(combobox()).toHaveFocus());
    await waitFor(() => expect(listbox()).toBeInTheDocument());

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
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
          <MultiSelect aria-label="Frameworks" options={OPTIONS} onValueChange={onValueChange} />
        </Popover.Content>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Filters" }));
    await user.click(await screen.findByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Vue" }));

    expect(onValueChange).toHaveBeenCalledWith(["vue"]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("MultiSelect variants", () => {
  it("underline and unstyled variants render", () => {
    const { container, rerender } = render(<MultiSelect aria-label="F" options={OPTIONS} variant="underline" />);
    const control = () => container.firstElementChild!.firstElementChild as HTMLElement;
    expect(control().className).toContain("astralis:border-b-2");
    rerender(<MultiSelect aria-label="F" options={OPTIONS} variant="unstyled" />);
    expect(control().className).toContain("astralis:bg-transparent");
  });
});
