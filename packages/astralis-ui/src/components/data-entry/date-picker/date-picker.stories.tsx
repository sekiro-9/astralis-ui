import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DatePicker } from "./index";
import type { DatePickerValue } from "./date-picker.types";
import { Field } from "../field";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

const meta: Meta<typeof DatePicker> = {
  title: "Components/Data Entry/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A field that opens a Calendar to pick a date, or a start and an end. The field is a button, so the value is always a real date; `name` submits it with a form as an ISO date.",
      },
    },
  },
  args: { "aria-label": "Date" },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Basic: Story = {
  args: { defaultMonth: new Date(2026, 10, 1) },
};

export const WithValue: Story = {
  args: { defaultValue: new Date(2026, 10, 23) },
};

/** Two clicks: the calendar closes when the end is chosen. */
export const Range: Story = {
  render: (args) => {
    const [value, setValue] = useState<DatePickerValue>({ start: new Date(2026, 10, 16), end: new Date(2026, 10, 20) });
    return (
      <VStack gap="2" alignItems="stretch" maxW="xs">
        <DatePicker {...args} selectionMode="range" value={value} onValueChange={setValue} />
        <Text size="sm" color="muted">
          {value && !(value instanceof Date) && value.end ? "Range complete" : "Pick an end date"}
        </Text>
      </VStack>
    );
  },
};

export const InsideField: Story = {
  render: (args) => (
    <Field maxW="xs" invalid>
      <Field.Label>Due date</Field.Label>
      <DatePicker {...args} aria-label={undefined} />
      <Field.ErrorText>Pick a date to continue.</Field.ErrorText>
    </Field>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <VStack gap="3" alignItems="stretch" maxW="xs">
      <DatePicker {...args} size="sm" />
      <DatePicker {...args} size="md" />
      <DatePicker {...args} size="lg" />
    </VStack>
  ),
};
