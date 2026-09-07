import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "./combobox";
import { Modal } from "../../overlay/modal";
import { Popover } from "../../overlay/popover";

const OPTIONS = [
  { label: "Next.js", value: "next" },
  { label: "Remix", value: "remix" },
  { label: "Astro", value: "astro" },
  { label: "Vite", value: "vite" },
  { label: "Gatsby", value: "gatsby", disabled: true },
];

const input = () => screen.getByRole("combobox") as HTMLInputElement;
const listbox = () => screen.getByRole("listbox");
const visibleOptions = () => screen.getAllByRole("option");

describe("Combobox filtering", () => {
  it("typing filters the options", async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} />);

    await user.type(input(), "re");
    await waitFor(() => expect(listbox()).toBeInTheDocument());
    const labels = visibleOptions().map((o) => o.textContent);
    expect(labels).toEqual(["Remix"]);
  });

  it("shows the empty text when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} emptyText="No matches" />);

    await user.type(input(), "zzz");
    expect(await screen.findByText("No matches")).toBeInTheDocument();
  });
});

describe("Combobox commit and revert", () => {
  it("ArrowDown + Enter commits the highlighted option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} onChange={onChange} />);

    await user.type(input(), "vi");
    await waitFor(() => expect(listbox()).toBeInTheDocument());
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith("vite");
    expect(input().value).toBe("Vite");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Escape closes and reverts the text to the committed selection", async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} defaultValue="remix" />);

    expect(input().value).toBe("Remix");
    await user.type(input(), "xxx"); // dirty the text
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input().value).toBe("Remix"); // reverted, not committed
  });

  it("aria-activedescendant tracks the highlighted option while focus stays in the input", async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} />);

    await user.type(input(), "a"); // matches Astro (and Gatsby, disabled)
    await waitFor(() => expect(listbox()).toBeInTheDocument());
    await user.keyboard("{ArrowDown}");

    expect(input()).toHaveFocus();
    const activeId = input().getAttribute("aria-activedescendant");
    expect(activeId).toBeTruthy();
    expect(document.getElementById(activeId!)).toHaveTextContent(/Astro|Gatsby/);
  });
});

describe("Combobox custom values", () => {
  it("Enter with nothing highlighted commits the typed text as the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} allowCustomValue onChange={onChange} />);

    await user.type(input(), "37px");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("37px");
    expect(input().value).toBe("37px");
  });

  it("typed text exactly matching a label commits that option, not raw text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} allowCustomValue onChange={onChange} />);

    await user.type(input(), "vite");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("vite");
    expect(input().value).toBe("Vite");
  });

  it("clicking away commits the typed text instead of dropping it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <div>
        <Combobox options={OPTIONS} allowCustomValue onChange={onChange} />
        <button type="button">elsewhere</button>
      </div>,
    );

    await user.type(input(), "2.5rem");
    await user.click(screen.getByText("elsewhere"));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("2.5rem"));
  });

  it("Escape still reverts to the committed value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} allowCustomValue defaultValue="next" onChange={onChange} />);

    await user.clear(input());
    await user.type(input(), "junk");
    await user.keyboard("{Escape}");

    expect(onChange).not.toHaveBeenCalled();
    expect(input().value).toBe("Next.js");
  });

  it("clearing the text and committing clears the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} allowCustomValue defaultValue="next" onChange={onChange} />);

    await user.clear(input());
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(null);
    expect(input().value).toBe("");
  });

  it("without the flag, unmatched text still reverts on close", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} defaultValue="next" onChange={onChange} />);

    await user.clear(input());
    await user.type(input(), "37px");
    await user.keyboard("{Escape}");

    expect(onChange).not.toHaveBeenCalled();
    expect(input().value).toBe("Next.js");
  });
});

describe("Combobox API and overlays", () => {
  it("fires onValueChange and the deprecated onChange on commit", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} onValueChange={onValueChange} onChange={onChange} />);

    await user.type(input(), "ast");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("astro");
    expect(onChange).toHaveBeenCalledWith("astro");
  });

  it("option ids stay valid when values contain spaces", async () => {
    const user = userEvent.setup();
    render(<Combobox options={[{ label: "New York", value: "new york" }]} />);

    await user.type(input(), "new");
    await user.keyboard("{ArrowDown}");
    const id = input().getAttribute("aria-activedescendant")!;
    expect(id).not.toMatch(/\s/);
    expect(document.getElementById(id)).toHaveTextContent("New York");
  });

  it("filters by searchLabel when given", async () => {
    const user = userEvent.setup();
    render(<Combobox options={[{ label: "United Kingdom", value: "uk", searchLabel: "united kingdom britain gb" }]} />);
    await user.type(input(), "brit");
    expect(visibleOptions().map((o) => o.textContent)).toEqual(["United Kingdom"]);
  });

  it("Escape closes the listbox only, not the Modal around it", async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen>
        <Modal.Content>
          <Modal.Title>Pick</Modal.Title>
          <Combobox aria-label="Framework" options={OPTIONS} />
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(input()).toHaveFocus());
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
          <Combobox options={OPTIONS} onValueChange={onValueChange} />
        </Popover.Content>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Filters" }));
    await user.click(await screen.findByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Vite" }));

    expect(onValueChange).toHaveBeenCalledWith("vite");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
