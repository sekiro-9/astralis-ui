import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertDialog } from "./index";
import { Button } from "../../buttons/button";

/**
 * AlertDialog is a Modal that asks for a decision: it announces as an
 * `alertdialog`, the overlay does not dismiss it, and there is no corner ✕.
 * Escape still cancels, per the ARIA pattern.
 */
const meta: Meta<typeof AlertDialog> = {
  title: "Components/Overlay/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

/** A destructive confirmation resolved through its footer actions. */
export const Basic: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialog.Trigger>
        <Button colorScheme="error">Delete workspace</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete workspace?</AlertDialog.Title>
          <AlertDialog.Description>All projects and members will be removed. This cannot be undone.</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Close>
            <Button variant="outline" colorScheme="gray">Cancel</Button>
          </AlertDialog.Close>
          <AlertDialog.Close>
            <Button colorScheme="error">Delete</Button>
          </AlertDialog.Close>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  ),
};

/** `closeOnEsc={false}` for flows where only an explicit choice may close it. */
export const NoEscape: Story = {
  render: () => (
    <AlertDialog closeOnEsc={false}>
      <AlertDialog.Trigger>
        <Button variant="outline" colorScheme="gray">Leave page</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Discard unsaved changes?</AlertDialog.Title>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Close>
            <Button variant="outline" colorScheme="gray">Keep editing</Button>
          </AlertDialog.Close>
          <AlertDialog.Close>
            <Button>Discard</Button>
          </AlertDialog.Close>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  ),
};
