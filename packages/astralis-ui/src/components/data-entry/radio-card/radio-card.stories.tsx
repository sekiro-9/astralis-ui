import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RadioCard } from "./index";
import { Radio } from "../radio";
import { Field } from "../field";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

const meta: Meta<typeof RadioCard> = {
  title: "Components/Data Entry/RadioCard",
  component: RadioCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A card-shaped radio for rich single-select choices such as plans or shipping options. It joins `Radio.Group` exactly as `Radio` does — give it a `value` inside a group.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioCard>;

/** A plan picker: one value, arrow keys move between cards. */
export const InGroup: Story = {
  render: () => {
    const [plan, setPlan] = useState("pro");
    return (
      <VStack gap="3" alignItems="stretch" maxW="md">
        <Field>
          <Field.Label>Plan</Field.Label>
          <Radio.Group value={plan} onValueChange={setPlan}>
            <RadioCard value="starter" description="For side projects">Starter</RadioCard>
            <RadioCard value="pro" description="For growing teams">Pro</RadioCard>
            <RadioCard value="enterprise" description="Talk to sales" disabled>
              Enterprise
            </RadioCard>
          </Radio.Group>
        </Field>
        <Text size="sm" color="muted">
          Selected: {plan}
        </Text>
      </VStack>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <Radio.Group defaultValue="md">
      <VStack gap="3" alignItems="stretch" maxW="md">
        <RadioCard size="sm" value="sm" description="Small">Compact</RadioCard>
        <RadioCard size="md" value="md" description="Medium">Default</RadioCard>
        <RadioCard size="lg" value="lg" description="Large">Roomy</RadioCard>
      </VStack>
    </Radio.Group>
  ),
};

export const WithoutIndicator: Story = {
  render: () => (
    <Radio.Group defaultValue="standard" colorScheme="purple">
      <VStack gap="3" alignItems="stretch" maxW="md">
        <RadioCard value="standard" indicator={false} description="3–5 business days">Standard</RadioCard>
        <RadioCard value="express" indicator={false} description="Next business day">Express</RadioCard>
      </VStack>
    </Radio.Group>
  ),
};
