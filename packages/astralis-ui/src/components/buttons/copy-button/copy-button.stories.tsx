import type { Meta, StoryObj } from "@storybook/react-vite";
import { HStack } from "../../layout/stack";
import { CopyButton } from "./index";

/**
 * CopyButton writes `value` to the clipboard and flips to a copied state for
 * `timeout` ms. It is a Button underneath, so every Button prop applies.
 */
const meta: Meta<typeof CopyButton> = {
  title: "Components/Buttons/CopyButton",
  component: CopyButton,
  tags: ["autodocs"],
  args: { value: "pnpm add astralis-ui" },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["solid", "subtle", "surface", "outline", "text", "link"],
    },
    size: { control: { type: "select" }, options: ["xs", "sm", "md", "lg", "xl"] },
    timeout: { control: { type: "number" } },
  },
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Usage: Story = {};

/** Any Button variant; the copied label is configurable. */
export const Variants: Story = {
  render: (args) => (
    <HStack gap="3">
      <CopyButton {...args} variant="solid" />
      <CopyButton {...args} variant="surface" copiedLabel="Done" />
      <CopyButton {...args} variant="text" size="sm" />
    </HStack>
  ),
};
