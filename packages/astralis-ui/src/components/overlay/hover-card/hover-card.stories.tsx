import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCard } from "./index";
import { Avatar } from "../../data-display/avatar";
import { HStack, VStack } from "../../layout/stack";
import { Link } from "../../typography/link";
import { Text } from "../../typography/text";

/**
 * HoverCard previews rich content on hover intent or keyboard focus. Unlike
 * Tooltip, the card is interactive: the close delay gives the pointer time to
 * travel into it. Escape closes it through the shared overlay stack.
 */
const meta: Meta<typeof HoverCard> = {
  title: "Components/Overlay/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

/** A profile card on a mention. */
export const Basic: Story = {
  render: () => (
    <Text>
      Built by{" "}
      <HoverCard>
        <HoverCard.Trigger>
          <Link href="#paul">@paul</Link>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <HStack gap="3" alignItems="start">
            <Avatar name="Paul Andrew" />
            <VStack gap="1" alignItems="start">
              <Text weight="semibold">Paul Andrew</Text>
              <Text size="sm">Building Astralis, a React 19 component library.</Text>
            </VStack>
          </HStack>
        </HoverCard.Content>
      </HoverCard>
      .
    </Text>
  ),
};

/** `openDelay` and `closeDelay` tune the hover intent. */
export const Delays: Story = {
  render: () => (
    <HoverCard openDelay={100} closeDelay={600} side="top">
      <HoverCard.Trigger>
        <Link href="#docs">Quick preview</Link>
      </HoverCard.Trigger>
      <HoverCard.Content>
        <Text size="sm">Opens after 100ms, and waits 600ms before closing.</Text>
      </HoverCard.Content>
    </HoverCard>
  ),
};
