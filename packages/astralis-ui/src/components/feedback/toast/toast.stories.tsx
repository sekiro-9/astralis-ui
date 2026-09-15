import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster, toast } from "./index";
import { Button } from "../../buttons/button";
import { HStack } from "../../layout/stack";

/**
 * Mount one `<Toaster />` near the app root, then call `toast(...)` from
 * anywhere. Toasts pause while hovered or focused, announce through
 * persistent live regions (errors and warnings assertively), and Escape
 * dismisses the focused one.
 */
const meta: Meta<typeof Toaster> = {
  title: "Components/Feedback/Toast",
  component: Toaster,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Statuses: Story = {
  render: () => (
    <>
      <HStack gap="2">
        <Button variant="outline" colorScheme="gray" onClick={() => toast({ title: "Heads up", description: "A new version is available." })}>
          Info
        </Button>
        <Button variant="outline" colorScheme="gray" onClick={() => toast.success("Changes saved")}>
          Success
        </Button>
        <Button variant="outline" colorScheme="gray" onClick={() => toast.warning("Storage almost full")}>
          Warning
        </Button>
        <Button variant="outline" colorScheme="gray" onClick={() => toast.error("Upload failed", { description: "Check your connection." })}>
          Error
        </Button>
      </HStack>
      <Toaster />
    </>
  ),
};

/** An action, and `duration: null` to keep a toast until it is dismissed. */
export const ActionAndPersistent: Story = {
  render: () => (
    <>
      <HStack gap="2">
        <Button
          onClick={() =>
            toast({ title: "Message archived", action: { label: "Undo", onClick: () => toast.success("Restored") } })
          }
        >
          Archive
        </Button>
        <Button variant="outline" colorScheme="gray" onClick={() => toast({ title: "Stays until dismissed", duration: null })}>
          Persistent
        </Button>
        <Button variant="text" colorScheme="gray" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </HStack>
      <Toaster placement="top-center" />
    </>
  ),
};
