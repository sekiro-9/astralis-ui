import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popout } from "./index";
import { HStack } from "../../layout/stack";
import { Text } from "../../typography/text";

/**
 * Popout is an anchored disclosure with no JavaScript: a native
 * `<button popovertarget>` and a `[popover]` panel placed by CSS anchor
 * positioning. The platform provides light dismiss, Escape and focus return.
 * For an actions menu with arrow keys, use Menu.
 */
const meta: Meta<typeof Popout> = {
  title: "Components/Overlay/Popout",
  component: Popout,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popout>;

export const Basic: Story = {
  render: () => (
    <Popout>
      <Popout.Trigger>Shipping details</Popout.Trigger>
      <Popout.Content>
        <Text size="sm">Orders placed before 2pm ship the same day.</Text>
      </Popout.Content>
    </Popout>
  ),
};

/** `side` and `align` map to `position-area`, with flip fallbacks. */
export const Sides: Story = {
  render: () => (
    <HStack gap="3">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popout key={side}>
          <Popout.Trigger>{side}</Popout.Trigger>
          <Popout.Content side={side} align="center">
            <Text size="sm">Opens on the {side}.</Text>
          </Popout.Content>
        </Popout>
      ))}
    </HStack>
  ),
};
