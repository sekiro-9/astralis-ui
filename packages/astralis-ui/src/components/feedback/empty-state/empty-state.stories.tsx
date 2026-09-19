import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { EmptyState } from "./index";
import { Button } from "../../buttons/button";
import { Icon } from "../../icon";
import { VStack } from "../../layout/stack";

const meta: Meta<typeof EmptyState> = {
  title: "Components/Feedback/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A blank slate for no results, nothing yet, or an error. Pure composition: it ships no client JavaScript, and `size` scales every part together.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoResults: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Indicator>
        <Icon as={Search} />
      </EmptyState.Indicator>
      <EmptyState.Title>No matches</EmptyState.Title>
      <EmptyState.Description>Try a shorter search, or clear a filter.</EmptyState.Description>
      <EmptyState.Actions>
        <Button variant="outline">Clear filters</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="8" alignItems="stretch">
      {(["sm", "md", "lg"] as const).map((size) => (
        <EmptyState key={size} size={size}>
          <EmptyState.Indicator>
            <Icon as={Search} />
          </EmptyState.Indicator>
          <EmptyState.Title>Size {size}</EmptyState.Title>
          <EmptyState.Description>Indicator, title and description scale together.</EmptyState.Description>
        </EmptyState>
      ))}
    </VStack>
  ),
};

/** Placement props size and space it like any other child. */
export const Placed: Story = {
  render: () => (
    <EmptyState maxW="sm" mx="auto" mt="8">
      <EmptyState.Title>No projects yet</EmptyState.Title>
      <EmptyState.Actions>
        <Button>New project</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
};
