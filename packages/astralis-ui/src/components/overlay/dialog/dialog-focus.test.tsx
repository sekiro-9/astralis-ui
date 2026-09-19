import { describe, expect, it } from "vitest";
import { createRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../modal";
import { Drawer } from "../drawer";

/** The LIB-B1 shape: controlled, an inline onOpenChange, and a field that
 *  re-renders the parent on every keystroke. */
function ControlledModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  return (
    <Modal open={open} onOpenChange={(o) => setOpen(o)}>
      <Modal.Trigger>
        <button>Edit profile</button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>Profile</Modal.Title>
        <input aria-label="Email" />
        <input aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Modal.Close>
          <button>Done</button>
        </Modal.Close>
      </Modal.Content>
    </Modal>
  );
}

function ControlledDrawer() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  return (
    <Drawer open={open} onOpenChange={(o) => setOpen(o)}>
      <Drawer.Trigger>
        <button>Filters</button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Title>Filters</Drawer.Title>
        <input aria-label="Email" />
        <input aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Drawer.Close>
          <button>Done</button>
        </Drawer.Close>
      </Drawer.Content>
    </Drawer>
  );
}

describe.each([
  ["Modal", ControlledModal, "Edit profile"],
  ["Drawer", ControlledDrawer, "Filters"],
] as const)("%s focus", (_name, Fixture, triggerName) => {
  it("typing into a field that re-renders the parent keeps focus in that field", async () => {
    const user = userEvent.setup();
    render(<Fixture />);

    await user.click(screen.getByRole("button", { name: triggerName }));
    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus());

    await user.click(screen.getByLabelText("Name"));
    await user.keyboard("Ada");
    await new Promise((r) => setTimeout(r, 10));

    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(screen.getByLabelText("Name")).toHaveValue("Ada");
  });

  it("traps Tab inside the panel and returns focus to the trigger on close", async () => {
    const user = userEvent.setup();
    render(<Fixture />);

    await user.click(screen.getByRole("button", { name: triggerName }));
    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus());

    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Email")).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("button", { name: triggerName })).toHaveFocus();
  });
});

describe("Dialog parts forward DOM props", () => {
  it("Modal parts take style, data attributes and refs", async () => {
    const contentRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    render(
      <Modal defaultOpen>
        <Modal.Trigger>
          <button ref={triggerRef}>Open</button>
        </Modal.Trigger>
        <Modal.Content ref={contentRef} style={{ maxWidth: 480 }} data-testid="panel">
          <Modal.Header style={{ paddingTop: 4 }} data-part="header">
            <Modal.Title style={{ letterSpacing: 1 }}>Title</Modal.Title>
            <Modal.CloseButton aria-label="Dismiss" />
          </Modal.Header>
          <Modal.Body id="body">Body</Modal.Body>
          <Modal.Footer style={{ gap: 2 }}>Footer</Modal.Footer>
        </Modal.Content>
      </Modal>,
    );

    const panel = await screen.findByTestId("panel");
    expect(contentRef.current).toBe(panel);
    expect(triggerRef.current).toBe(screen.getByRole("button", { name: "Open" }));
    expect(panel.style.maxWidth).toBe("480px");
    expect(panel.style.transitionDuration).toBe("200ms"); // own styles survive a style prop
    expect(panel).toHaveAttribute("aria-labelledby", screen.getByText("Title").id);
    expect(document.querySelector('[data-part="header"]')).toHaveStyle({ paddingTop: "4px" });
    expect(screen.getByText("Title")).toHaveStyle({ letterSpacing: "1px" });
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    expect(document.getElementById("body")).toHaveTextContent("Body");
    expect(screen.getByText("Footer")).toHaveStyle({ gap: "2px" });
  });

  it("Drawer parts take style and data attributes", async () => {
    render(
      <Drawer defaultOpen>
        <Drawer.Content style={{ width: 300 }} data-testid="panel">
          <Drawer.Header data-part="header">
            <Drawer.Title>Title</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body style={{ padding: 3 }}>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );

    const panel = await screen.findByTestId("panel");
    expect(panel.style.width).toBe("300px");
    expect(document.querySelector('[data-part="header"]')).not.toBeNull();
    expect(screen.getByText("Body")).toHaveStyle({ padding: "3px" });
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
