import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AlertDialog } from "./index";
import { Button } from "../../buttons/button";

function Fixture() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete workspace?</AlertDialog.Title>
          <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Close>
            <Button variant="outline" colorScheme="gray">Cancel</Button>
          </AlertDialog.Close>
          <Button colorScheme="error">Delete</Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}

describe("AlertDialog", () => {
  it("announces as an alertdialog wired to its title and description", () => {
    const { baseElement } = render(<Fixture />);
    const panel = baseElement.querySelector('[role="alertdialog"]')!;
    expect(panel).not.toBeNull();
    expect(panel.getAttribute("aria-labelledby")).toBeTruthy();
    expect(panel.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("does not dismiss on overlay click — resolution must be an explicit action", () => {
    const { baseElement, getByText } = render(<Fixture />);
    const overlay = baseElement.querySelector('[aria-hidden="true"]')!;
    fireEvent.click(overlay);
    expect(baseElement.querySelector('[role="alertdialog"]')).not.toBeNull();
    // The Cancel action still closes it.
    fireEvent.click(getByText("Cancel"));
    expect(baseElement.querySelector('[role="alertdialog"]')?.className ?? "").not.toContain("astralis:opacity-100");
  });
});
