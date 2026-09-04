import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CheckboxCard } from "./index";
import { Checkbox } from "../checkbox";
import { Field } from "../field";
import { VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

const meta: Meta<typeof CheckboxCard> = {
  title: "Components/Data Entry/CheckboxCard",
  component: CheckboxCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A card-shaped checkbox for rich multi-select choices. It joins `Checkbox.Group` exactly as `Checkbox` does — give it a `value` inside a group.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxCard>;

export const Basic: Story = {
  args: { children: "Daily digest", description: "One email each morning with everything you missed." },
};

/** Inside `Checkbox.Group`, cards accumulate into one array value. */
export const InGroup: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["analytics"]);
    return (
      <VStack gap="3" alignItems="stretch" maxW="md">
        <Field>
          <Field.Label>Add-ons</Field.Label>
          <Checkbox.Group value={value} onValueChange={setValue}>
            <CheckboxCard value="analytics" description="Dashboards and weekly reports">
              Analytics
            </CheckboxCard>
            <CheckboxCard value="backups" description="Nightly snapshots, kept for 30 days">
              Backups
            </CheckboxCard>
            <CheckboxCard value="sso" description="SAML and SCIM provisioning" disabled>
              Single sign-on
            </CheckboxCard>
          </Checkbox.Group>
        </Field>
        <Text size="sm" color="muted">
          Selected: {value.join(", ") || "none"}
        </Text>
      </VStack>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="3" alignItems="stretch" maxW="md">
      <CheckboxCard size="sm" description="Small">Compact</CheckboxCard>
      <CheckboxCard size="md" description="Medium" defaultChecked>Default</CheckboxCard>
      <CheckboxCard size="lg" description="Large">Roomy</CheckboxCard>
    </VStack>
  ),
};

export const ColorSchemeAndInvalid: Story = {
  render: () => (
    <VStack gap="3" alignItems="stretch" maxW="md">
      <CheckboxCard colorScheme="green" defaultChecked description="Paints from the accent channel">
        Green when checked
      </CheckboxCard>
      <CheckboxCard invalid description="Shown with an error border">
        Needs attention
      </CheckboxCard>
    </VStack>
  ),
};
