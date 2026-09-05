import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { NumberInput } from "./index";
import { Field } from "../field";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

const meta: Meta<typeof NumberInput> = {
  title: "Components/Data Entry/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A numeric field with steppers and spinbutton keys (↑ ↓ Home End). Typing is free-form; the value parses, clamps and rounds when it commits on blur, Enter or a stepper click, and `onValueChange` fires only when the committed value changes.",
      },
    },
  },
  args: { "aria-label": "Quantity" },
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Basic: Story = {
  args: { defaultValue: 3, min: 0, max: 10 },
};

/** Controlled; `null` means empty. */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<number | null>(12.5);
    return (
      <VStack gap="2" alignItems="stretch" maxW="xs">
        <NumberInput {...args} value={value} onValueChange={setValue} step={0.5} precision={1} />
        <Text size="sm" color="muted">
          Committed: {value === null ? "empty" : value}
        </Text>
      </VStack>
    );
  },
};

export const InField: Story = {
  render: () => (
    <Field required maxW="xs">
      <Field.Label>Seats</Field.Label>
      <NumberInput min={1} max={50} defaultValue={5} />
      <Field.HelpText>Between 1 and 50.</Field.HelpText>
    </Field>
  ),
};

export const SizesAndVariants: Story = {
  render: (args) => (
    <VStack gap="3" alignItems="stretch" maxW="xs">
      <NumberInput {...args} size="sm" defaultValue={1} />
      <NumberInput {...args} size="md" variant="filled" defaultValue={2} />
      <NumberInput {...args} size="lg" variant="underline" defaultValue={3} />
      <NumberInput {...args} colorScheme="green" defaultValue={4} />
      <NumberInput {...args} invalid defaultValue={5} />
      <NumberInput {...args} hideSteppers defaultValue={6} />
    </VStack>
  ),
};
