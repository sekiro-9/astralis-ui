import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Alert } from "./index";
import { Button } from "../../buttons/button";
import { VStack } from "../../layout/stack";

const meta: Meta<typeof Alert> = {
  title: "Components/Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An inline message. `status` picks the icon, the hue and the ARIA role: errors and warnings announce assertively (`alert`), info and success politely (`status`).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

const statuses = ["info", "success", "warning", "error"] as const;

export const Statuses: Story = {
  render: () => (
    <VStack gap="3" alignItems="stretch" maxW="lg">
      {statuses.map((status) => (
        <Alert key={status} status={status}>
          <Alert.Title>{status[0].toUpperCase() + status.slice(1)}</Alert.Title>
          <Alert.Description>Your changes were processed.</Alert.Description>
        </Alert>
      ))}
    </VStack>
  ),
};

export const Variants: Story = {
  render: () => (
    <VStack gap="3" alignItems="stretch" maxW="lg">
      {(["subtle", "solid", "outline", "left-accent"] as const).map((variant) => (
        <Alert key={variant} status="info" variant={variant}>
          <Alert.Title>{variant}</Alert.Title>
        </Alert>
      ))}
    </VStack>
  ),
};

export const Dismissible: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return open ? (
      <Alert status="success" onClose={() => setOpen(false)} maxW="lg">
        <Alert.Title>Invite sent</Alert.Title>
        <Alert.Description>They will get an email in a minute.</Alert.Description>
      </Alert>
    ) : (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show again
      </Button>
    );
  },
};

export const CustomHueAndNoIcon: Story = {
  render: () => (
    <VStack gap="3" alignItems="stretch" maxW="lg">
      <Alert status="info" colorScheme="purple">
        <Alert.Title>Beta feature</Alert.Title>
      </Alert>
      <Alert status="warning" icon={false}>
        <Alert.Description>No icon, same role and hue.</Alert.Description>
      </Alert>
    </VStack>
  ),
};
