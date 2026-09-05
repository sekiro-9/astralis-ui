import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Editable } from "./index";
import { Field } from "../field";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

const meta: Meta<typeof Editable> = {
  title: "Components/Data Entry/Editable",
  component: Editable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Click-to-edit text. The preview is a button; clicking it (or pressing Enter) swaps in an input. Enter commits, Escape cancels, and blur follows `submitOnBlur`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Editable>;

export const Basic: Story = {
  render: () => (
    <Editable defaultValue="Quarterly roadmap">
      <Editable.Preview />
      <Editable.Input aria-label="Document title" />
    </Editable>
  ),
};

/** `onValueChange` fires when a changed edit is committed; `onSubmit` on every commit. */
export const Controlled: Story = {
  render: () => {
    const [title, setTitle] = useState("Untitled board");
    return (
      <VStack gap="2" alignItems="start">
        <Editable value={title} onValueChange={setTitle} size="lg">
          <Editable.Preview />
          <Editable.Input aria-label="Board name" />
        </Editable>
        <Text size="sm" color="muted">
          Saved as: {title}
        </Text>
      </VStack>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="3" alignItems="start">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Editable key={size} size={size} defaultValue={`Size ${size}`}>
          <Editable.Preview />
          <Editable.Input aria-label={`Size ${size}`} />
        </Editable>
      ))}
    </VStack>
  ),
};

export const EmptyWithPlaceholder: Story = {
  render: () => (
    <Editable placeholder="Add a description" colorScheme="green">
      <Editable.Preview />
      <Editable.Input aria-label="Description" />
    </Editable>
  ),
};

/** Inside a Field, the label names the input and disabled, read-only and invalid come from the Field. */
export const InField: Story = {
  render: () => (
    <Field invalid>
      <Field.Label>Project name</Field.Label>
      <Editable defaultValue="a" startWithEditView>
        <Editable.Preview />
        <Editable.Input />
      </Editable>
      <Field.ErrorText>Use at least three characters.</Field.ErrorText>
    </Field>
  ),
};
