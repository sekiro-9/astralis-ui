import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Skeleton } from "./index";
import { HStack, VStack } from "../../layout/stack";
import { Text } from "../../typography/text";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Feedback/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A pulsing placeholder that holds space while content loads. It is hidden from assistive tech; announce the loading state on the surrounding region (`aria-busy`) or with a Loader.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Shapes: Story = {
  render: () => (
    <HStack gap="4" alignItems="start" maxW="md">
      <Skeleton variant="circle" w="12" h="12" />
      <VStack gap="2" alignItems="stretch" flex="1">
        <Skeleton variant="text" w="3/4" />
        <Skeleton variant="text" />
        <Skeleton variant="rect" h="24" />
      </VStack>
    </HStack>
  ),
};

/** `loaded` swaps in the children without shifting layout. */
export const Loaded: Story = {
  render: () => {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
      const timer = setTimeout(() => setLoaded(true), 1500);
      return () => clearTimeout(timer);
    }, []);
    return (
      <VStack gap="2" alignItems="stretch" maxW="md" aria-busy={!loaded}>
        <Skeleton loaded={loaded}>
          <Text weight="semibold">Quarterly report</Text>
        </Skeleton>
        <Skeleton loaded={loaded}>
          <Text color="muted">Revenue grew in every region.</Text>
        </Skeleton>
      </VStack>
    );
  },
};

export const Static: Story = {
  args: { animated: false, variant: "rect", h: "16" },
  render: (args) => <Skeleton {...args} maxW="md" />,
};
