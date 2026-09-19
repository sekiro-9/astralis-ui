import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./index";
import { HStack, VStack } from "../../layout/stack";

const meta: Meta<typeof Progress> = {
  title: "Components/Feedback/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Determinate or indeterminate progress as a bar or a ring. Leave out `value` for the indeterminate animation. Name it with `aria-label`, which lands on the progressbar element.",
      },
    },
  },
  args: { "aria-label": "Upload" },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Line: Story = {
  args: { value: 62, showValueLabel: true },
  render: (args) => <Progress {...args} maxW="md" />,
};

export const Indeterminate: Story = {
  render: (args) => (
    <VStack gap="6" alignItems="start">
      <Progress {...args} maxW="md" w="full" />
      <Progress {...args} shape="circle" />
    </VStack>
  ),
};

export const Circle: Story = {
  render: (args) => (
    <HStack gap="6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Progress key={size} {...args} shape="circle" size={size} value={40} showValueLabel />
      ))}
    </HStack>
  ),
};

export const SizesAndColors: Story = {
  render: (args) => (
    <VStack gap="4" alignItems="stretch" maxW="md">
      <Progress {...args} size="sm" value={25} />
      <Progress {...args} size="md" value={50} colorScheme="green" />
      <Progress {...args} size="lg" value={75} colorScheme="orange" />
    </VStack>
  ),
};
