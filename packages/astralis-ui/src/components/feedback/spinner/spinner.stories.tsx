import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./index";
import { HStack } from "../../layout/stack";

const meta: Meta<typeof Spinner> = {
  title: "Components/Feedback/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An indeterminate loading indicator. It is a live `status` with a visually hidden `label`, so the loading state is announced.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Basic: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap="4">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Spinner key={size} size={size} />
      ))}
    </HStack>
  ),
};

export const Colors: Story = {
  render: () => (
    <HStack gap="4">
      {(["brand", "green", "orange", "red"] as const).map((colorScheme) => (
        <Spinner key={colorScheme} colorScheme={colorScheme} label={`Loading ${colorScheme}`} />
      ))}
    </HStack>
  ),
};
