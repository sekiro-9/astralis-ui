import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "../../layout/box";
import { Flex } from "../../layout/flex";
import { Heading } from "../../typography/heading";
import { Text } from "../../typography/text";
import { TableOfContents } from "./index";

/**
 * "On this page" navigation. Entries are plain anchors, so they work without
 * JavaScript; scroll-spy highlights the section on screen.
 */
const meta: Meta<typeof TableOfContents> = {
  title: "Components/Navigation/TableOfContents",
  component: TableOfContents,
  tags: ["autodocs"],
  argTypes: {
    showLabel: { control: { type: "boolean" } },
    offset: { control: { type: "number" } },
  },
};

export default meta;
type Story = StoryObj<typeof TableOfContents>;

const sections = [
  { id: "toc-install", title: "Installation" },
  { id: "toc-usage", title: "Usage" },
  { id: "toc-props", title: "Props", depth: 1 },
  { id: "toc-a11y", title: "Accessibility" },
];

export const Usage: Story = {
  render: (args) => (
    <Flex gap="8" alignItems="start">
      <Box flex="1">
        {sections.map((section) => (
          <Box key={section.id} mb="8">
            <Heading as={section.depth ? "h3" : "h2"} id={section.id} gutterBottom>
              {section.title}
            </Heading>
            <Text color="muted">Scroll the canvas and the matching entry highlights.</Text>
            <Box h="64" />
          </Box>
        ))}
      </Box>
      <TableOfContents {...args} items={sections} offset={0} w="56" position="sticky" top="0" />
    </Flex>
  ),
};
