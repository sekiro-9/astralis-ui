import type { Meta, StoryObj } from "@storybook/react-vite";
import { Collapsible } from "./index";
import { VStack } from "../../layout/stack";

const meta: Meta<typeof Collapsible> = {
  title: "Components/Disclosure/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A single disclosure built on native `<details>`/`<summary>`: the browser owns the open state, so it works with JavaScript disabled and ships none. Collapsibles sharing a `name` open one at a time.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Basic: Story = {
  render: () => (
    <Collapsible maxW="md">
      <Collapsible.Trigger>What is included in the free plan?</Collapsible.Trigger>
      <Collapsible.Content>Three projects, unlimited viewers and a week of version history.</Collapsible.Content>
    </Collapsible>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible defaultOpen maxW="md">
      <Collapsible.Trigger>Release notes</Collapsible.Trigger>
      <Collapsible.Content>Faster exports and a new colour picker.</Collapsible.Content>
    </Collapsible>
  ),
};

/** A shared `name` makes the group exclusive, natively. */
export const ExclusiveGroup: Story = {
  render: () => (
    <VStack gap="2" alignItems="stretch" maxW="md">
      {["Shipping", "Returns", "Warranty"].map((topic) => (
        <Collapsible key={topic} name="faq">
          <Collapsible.Trigger>{topic}</Collapsible.Trigger>
          <Collapsible.Content>Everything about {topic.toLowerCase()}.</Collapsible.Content>
        </Collapsible>
      ))}
    </VStack>
  ),
};

export const WithoutIndicator: Story = {
  render: () => (
    <Collapsible maxW="md">
      <Collapsible.Trigger hideIndicator>Show details</Collapsible.Trigger>
      <Collapsible.Content>Details, without the chevron.</Collapsible.Content>
    </Collapsible>
  ),
};
