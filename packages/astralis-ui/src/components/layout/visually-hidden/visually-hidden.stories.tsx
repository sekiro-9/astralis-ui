import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../buttons/button";
import { Text } from "../../typography/text";
import { VisuallyHidden } from "./index";

/**
 * Content for assistive technology only: removed from view, still announced.
 * The hidden text in these examples is there on purpose.
 */
const meta: Meta<typeof VisuallyHidden> = {
  title: "Components/Layout/VisuallyHidden",
  component: VisuallyHidden,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

/** Names an icon-only control without showing a label. */
export const Usage: Story = {
  render: () => (
    <Button variant="outline" colorScheme="gray" leftIcon={<span aria-hidden="true">✕</span>}>
      <VisuallyHidden>Close dialog</VisuallyHidden>
    </Button>
  ),
};

/** Extra context for a screen reader inside visible text. */
export const InlineContext: Story = {
  render: () => (
    <Text>
      Price: $12<VisuallyHidden> per month, billed annually</VisuallyHidden>
    </Text>
  ),
};
