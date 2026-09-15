import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../../typography/text";
import { Box } from "../box";
import { Flex } from "../flex";
import { ScrollArea } from "./index";

/**
 * A scroll container with themed native scrollbars and no client JavaScript.
 * Give it a height (`h` or `maxH`). It is a tab stop, so keyboard users can
 * scroll it.
 */
const meta: Meta<typeof ScrollArea> = {
  title: "Components/Layout/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  argTypes: {
    direction: { control: { type: "inline-radio" }, options: ["vertical", "horizontal", "both"] },
    hideScrollbar: { control: { type: "boolean" } },
  },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const lines = Array.from({ length: 30 }, (_, i) => `Changelog entry ${i + 1}`);

export const Usage: Story = {
  render: (args) => (
    <Box border="normal" borderColor="muted" rounded="md" w="72">
      <ScrollArea maxH="48" {...args}>
        <Box p="3">
          {lines.map((line) => (
            <Text key={line} size="sm">
              {line}
            </Text>
          ))}
        </Box>
      </ScrollArea>
    </Box>
  ),
};

/** Horizontal overflow, such as a row of chips. */
export const Horizontal: Story = {
  render: () => (
    <Box border="normal" borderColor="muted" rounded="md" w="72">
      <ScrollArea direction="horizontal">
        <Flex gap="2" p="3" w="max">
          {lines.slice(0, 12).map((line) => (
            <Box key={line} bg="subtle" px="3" py="1" rounded="full" shrink="0">
              <Text size="sm">{line}</Text>
            </Box>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  ),
};
