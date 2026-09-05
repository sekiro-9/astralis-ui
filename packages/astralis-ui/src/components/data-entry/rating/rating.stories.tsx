import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Rating } from "./index";
import { Field } from "../field";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

const meta: Meta<typeof Rating> = {
  title: "Components/Data Entry/Rating",
  component: Rating,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Star rating built on native radios, so arrow keys and form submission come from the platform. `readOnly` renders a static display that can show half stars.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Basic: Story = {
  args: { defaultValue: 3, label: "Rate this recipe" },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(4);
    return (
      <VStack gap="2" alignItems="start">
        <Rating value={value} onValueChange={setValue} label="Service" />
        <Text size="sm" color="muted">
          {value} of 5
        </Text>
      </VStack>
    );
  },
};

/** Fractional values render as partial stars in read-only mode. */
export const ReadOnly: Story = {
  args: { value: 3.5, readOnly: true },
};

export const SizesAndColors: Story = {
  render: () => (
    <VStack gap="3" alignItems="start">
      <Rating size="sm" defaultValue={2} label="Small" />
      <Rating size="md" defaultValue={3} colorScheme="orange" label="Medium" />
      <Rating size="lg" defaultValue={4} colorScheme="red" max={6} label="Large" />
    </VStack>
  ),
};

/** Inside a Field the label names the group, and disabled/invalid/required come from the Field. */
export const InField: Story = {
  render: () => (
    <Field invalid required>
      <Field.Label>Overall experience</Field.Label>
      <Rating name="experience" />
      <Field.ErrorText>Choose a rating.</Field.ErrorText>
    </Field>
  ),
};
