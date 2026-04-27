import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../../typography";
import Box from "./box";

const meta: Meta<typeof Box> = {
  title: "Components/Layout/Box",
  component: Box,
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: { type: "text" },
      description: "The HTML element or React component to render the text as.",
      table: {
        defaultValue: { summary: "div" },
      },
    },
    children: {
      control: { type: "text" },
      description: "Text content",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The most abstract styling component in Astralis UI on top of which all other Astralis UI components are built.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Usage: Story = {
  render: () => (
    <Box
      bg="muted"
      display={"block"}
      p={"8"}
      rounded={"xl"}
      border={"normal"}
      borderColor={"base"}
      w={"full"}
    >
      <Text>This is a Box</Text>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic usage of the Box Component",
      },
    },
  },
};
