import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loader } from "./index";
import { HStack } from "../../layout/stack";

const meta: Meta<typeof Loader> = {
  title: "Components/Feedback/Loader",
  component: Loader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An indeterminate loading indicator in five variants, `blocks` by default. It is a live `status` with a visually hidden `label`, so the loading state is announced.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Basic: Story = {};

export const Variants: Story = {
  render: () => (
    <HStack gap="6">
      {(["blocks", "spinner", "dots", "bars", "pulse"] as const).map((variant) => (
        <Loader key={variant} variant={variant} size="lg" label={`Loading (${variant})`} />
      ))}
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="4">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Loader key={size} size={size} />
      ))}
    </HStack>
  ),
};

export const Colors: Story = {
  render: () => (
    <HStack gap="4">
      {(["brand", "green", "orange", "red"] as const).map((colorScheme) => (
        <Loader key={colorScheme} colorScheme={colorScheme} label={`Loading ${colorScheme}`} />
      ))}
    </HStack>
  ),
};
