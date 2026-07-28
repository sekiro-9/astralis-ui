import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "./link";
import { Box } from "../../layout/box";
import { HStack, VStack } from "../../layout/stack";
import Text from "../text/text";

/**
 * Link is text with special highlighting. It takes Text's typography props —
 * `size`, `weight`, `color`, `casing` and the rest — on top of its own recipe,
 * and paints from the accent channel so `colorScheme` recolours it.
 *
 * Unlike Text it defaults none of the typography: a bare Link inherits from the
 * paragraph it sits in, which is what an inline link should do.
 */
const meta: Meta<typeof Link> = {
  title: "Components/Typography/Link",
  component: Link,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["underline", "hover", "plain"],
      table: { defaultValue: { summary: "hover" } },
    },
    colorScheme: {
      control: { type: "select" },
      options: ["brand", "gray", "blue", "green", "red", "error", "success"],
      table: { defaultValue: { summary: "brand" } },
    },
    external: { control: { type: "boolean" } },
  },
  args: { href: "#", children: "Read the documentation" },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {};

/** `underline` is always on, `hover` reveals it, `plain` never shows one. */
export const Variants: Story = {
  render: () => (
    <VStack gap="3" alignItems="start">
      {(["underline", "hover", "plain"] as const).map((variant) => (
        <HStack key={variant} gap="3" alignItems="center">
          <Box w="20">
            <Text size="xs" color="muted">
              {variant}
            </Text>
          </Box>
          <Link href="#" variant={variant}>
            Read the documentation
          </Link>
        </HStack>
      ))}
    </VStack>
  ),
};

/** Typography props come straight from Text, so a link can be any size or weight. */
export const Typography: Story = {
  render: () => (
    <VStack gap="3" alignItems="start">
      <Link href="#" size="xs">
        Extra small
      </Link>
      <Link href="#" size="sm" weight="medium">
        Small, medium weight
      </Link>
      <Link href="#" size="lg" weight="semibold">
        Large, semibold
      </Link>
      <Link href="#" size="sm" casing="uppercase" letterSpacing="wider" weight="semibold">
        Uppercase eyebrow link
      </Link>
    </VStack>
  ),
};

/** Left alone, a Link inherits the size of the text around it. */
export const InheritsSurroundingType: Story = {
  render: () => (
    <VStack gap="4" alignItems="start">
      <Text size="xs">
        Extra small copy with an <Link href="#">inline link</Link> inside it.
      </Text>
      <Text size="lg">
        Large copy with an <Link href="#">inline link</Link> inside it.
      </Text>
    </VStack>
  ),
};

/** `colorScheme` moves both states together — rest and hover. */
export const ColorSchemes: Story = {
  render: () => (
    <HStack gap="5" wrap="wrap">
      {(["brand", "gray", "blue", "green", "error"] as const).map((scheme) => (
        <Link key={scheme} href="#" colorScheme={scheme} variant="hover">
          {scheme}
        </Link>
      ))}
    </HStack>
  ),
};

/**
 * An explicit `color` holds in both states, so the hover shift is dropped and
 * the underline carries the affordance. This is what makes a link usable on a
 * surface the accent channel does not cover — an inverted footer, say.
 */
export const ExplicitColour: Story = {
  render: () => (
    <VStack gap="4" alignItems="start">
      <Link href="#" color="muted" variant="hover">
        Muted link, underlines on hover
      </Link>
      <Box bg="inverted" p="5" rounded="lg">
        <HStack gap="5">
          <Link href="#" color="inverted" variant="hover">
            On an inverted surface
          </Link>
          <Link href="#" color="inverted" variant="underline">
            Always underlined
          </Link>
        </HStack>
      </Box>
    </VStack>
  ),
};

/** `external` adds target, rel and a marker. */
export const External: Story = {
  args: { external: true, children: "Open the changelog" },
};
