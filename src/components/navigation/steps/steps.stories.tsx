import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Steps } from "./steps";
import { Step } from "./step";

const meta: Meta<typeof Steps> = {
  title: "Components/Navigation/Steps",
  component: Steps,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: {
      control: { type: "number", min: 0 },
      description: "Current active step (0-based index)",
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    clickable: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Steps>;

export const Default: Story = {
  args: {
    value: 1,
  },
  render: (args) => (
    <Steps {...args}>
      <Step title="Account" />
      <Step title="Profile" />
      <Step title="Confirm" />
    </Steps>
  ),
};

export const WithDescriptions: Story = {
  args: {
    value: 1,
  },
  render: (args) => (
    <Steps {...args}>
      <Step title="Account" description="Create your account" />
      <Step title="Profile" description="Personal information" />
      <Step title="Confirm" description="Review and submit" />
    </Steps>
  ),
};

export const Clickable: Story = {
  render: () => {
    const [step, setStep] = useState(0);

    return (
      <Steps value={step} clickable onChange={setStep}>
        <Step title="Account" />
        <Step title="Profile" />
        <Step title="Confirm" />
      </Steps>
    );
  },
};

export const DisabledStep: Story = {
  args: {
    value: 0,
  },
  render: (args) => (
    <Steps {...args} clickable>
      <Step title="Account" />
      <Step title="Profile" disabled />
      <Step title="Confirm" />
    </Steps>
  ),
};

export const Vertical: Story = {
  args: {
    value: 1,
    orientation: "vertical",
  },
  render: (args) => (
    <Steps {...args}>
      <Step title="Account" />
      <Step title="Profile" />
      <Step title="Confirm" />
    </Steps>
  ),
};

export const Completed: Story = {
  args: {
    value: 3,
  },
  render: (args) => (
    <Steps {...args}>
      <Step title="Account" />
      <Step title="Profile" />
      <Step title="Confirm" />
    </Steps>
  ),
};
