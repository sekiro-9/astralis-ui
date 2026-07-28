import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "./kbd";
import { Box } from "../../layout/box";
import { HStack, VStack } from "../../layout/stack";
import Text from "../text/text";

/**
 * Kbd is a keyboard-key cap. It renders a semantic `<kbd>` and carries a heavier
 * bottom border, which is what gives a keycap its pressed depth without a shadow.
 *
 * One key per element — a chord is several Kbds side by side, so screen readers
 * announce the keys individually rather than as one run-on string.
 */
const meta: Meta<typeof Kbd> = {
  title: "Components/Typography/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      table: { defaultValue: { summary: "md" } },
    },
  },
  args: { children: "K" },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {};

/** Three sizes, matched to the text they sit beside. */
export const Sizes: Story = {
  render: () => (
    <VStack gap="4" alignItems="start">
      {(["sm", "md", "lg"] as const).map((size) => (
        <HStack key={size} gap="3" alignItems="center">
          <Box w="8">
            <Text size="xs" color="muted">
              {size}
            </Text>
          </Box>
          <Kbd size={size}>⌘</Kbd>
          <Kbd size={size}>K</Kbd>
        </HStack>
      ))}
    </VStack>
  ),
};

/** A chord is several caps, not one cap with a plus inside it. */
export const Chord: Story = {
  render: () => (
    <HStack gap="1.5" alignItems="center">
      <Kbd>⌘</Kbd>
      <Text as="span" size="xs" color="subtle">
        +
      </Text>
      <Kbd>⇧</Kbd>
      <Text as="span" size="xs" color="subtle">
        +
      </Text>
      <Kbd>P</Kbd>
    </HStack>
  ),
};

/** Inline in a sentence, where it should not disturb the line height. */
export const Inline: Story = {
  render: () => (
    <Box maxW="sm">
      <Text>
        Press <Kbd size="sm">⌘</Kbd> <Kbd size="sm">K</Kbd> to open the command
        palette, or <Kbd size="sm">Esc</Kbd> to dismiss it.
      </Text>
    </Box>
  ),
};
