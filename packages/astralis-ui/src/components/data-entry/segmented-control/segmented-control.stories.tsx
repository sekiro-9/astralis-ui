import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SegmentedControl } from "./index";
import { Field } from "../field";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/Data Entry/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A single choice shown as connected segments — the view-switcher pattern. Native radios underneath give arrow-key movement and form participation.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const views = (
  <>
    <SegmentedControl.Item value="list">List</SegmentedControl.Item>
    <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
    <SegmentedControl.Item value="calendar">Calendar</SegmentedControl.Item>
  </>
);

export const Basic: Story = {
  render: () => (
    <SegmentedControl aria-label="View" defaultValue="list">
      {views}
    </SegmentedControl>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [view, setView] = useState("board");
    return (
      <VStack gap="2" alignItems="start">
        <SegmentedControl aria-label="View" value={view} onValueChange={setView}>
          {views}
        </SegmentedControl>
        <Text size="sm" color="muted">
          Showing {view}
        </Text>
      </VStack>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="3" alignItems="start">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SegmentedControl key={size} aria-label={size} size={size} defaultValue="list">
          {views}
        </SegmentedControl>
      ))}
    </VStack>
  ),
};

/** `colorScheme` tints the focus ring and the selected label. */
export const ColorScheme: Story = {
  render: () => (
    <SegmentedControl aria-label="View" colorScheme="purple" defaultValue="calendar">
      {views}
    </SegmentedControl>
  ),
};

export const FullWidthInField: Story = {
  render: () => (
    <Field maxW="md">
      <Field.Label>Default view</Field.Label>
      <SegmentedControl fullWidth defaultValue="list">
        {views}
      </SegmentedControl>
      <Field.HelpText>Used when you open a project.</Field.HelpText>
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <SegmentedControl aria-label="View" defaultValue="list" disabled>
      {views}
    </SegmentedControl>
  ),
};
