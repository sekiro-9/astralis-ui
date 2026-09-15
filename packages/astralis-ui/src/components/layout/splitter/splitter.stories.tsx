import type { Meta, StoryObj } from "@storybook/react-vite";
import { Center } from "../center";
import { Text } from "../../typography/text";
import { Splitter } from "./index";

/**
 * Two panels with a draggable divider. The handle is a `role="separator"`:
 * arrow keys resize in steps, Home/End jump to `minSize`/`maxSize`.
 */
const meta: Meta<typeof Splitter> = {
  title: "Components/Layout/Splitter",
  component: Splitter,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: { type: "inline-radio" }, options: ["horizontal", "vertical"] },
    defaultSize: { control: { type: "number" } },
    minSize: { control: { type: "number" } },
    maxSize: { control: { type: "number" } },
  },
};

export default meta;
type Story = StoryObj<typeof Splitter>;

function Pane({ label }: { label: string }) {
  return (
    <Center h="full" bg="subtle">
      <Text color="muted">{label}</Text>
    </Center>
  );
}

export const Usage: Story = {
  render: (args) => (
    <Splitter h="64" w="full" {...args}>
      <Splitter.Panel>
        <Pane label="Sidebar" />
      </Splitter.Panel>
      <Splitter.Handle aria-label="Resize sidebar" />
      <Splitter.Panel>
        <Pane label="Content" />
      </Splitter.Panel>
    </Splitter>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Splitter orientation="vertical" defaultSize={60} h="80" w="full">
      <Splitter.Panel>
        <Pane label="Editor" />
      </Splitter.Panel>
      <Splitter.Handle aria-label="Resize editor" />
      <Splitter.Panel>
        <Pane label="Terminal" />
      </Splitter.Panel>
    </Splitter>
  ),
};
