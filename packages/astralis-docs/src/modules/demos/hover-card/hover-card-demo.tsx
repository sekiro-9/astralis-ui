import { HoverCard, Avatar, Button, HStack, VStack, Text, Link } from "astralis-ui";

export function HoverCardDemo() {
  return (
    <Text size="sm">
      Mentioned by{" "}
      <HoverCard>
        <HoverCard.Trigger>
          <Link href="#astralis">@astralis</Link>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <HStack gap="3" alignItems="start">
            <Avatar name="Astralis UI" />
            <VStack gap="1" alignItems="start">
              <Text size="sm" weight="semibold">
                Astralis UI
              </Text>
              <Text size="xs" color="muted">
                React 19 components on semantic design tokens. Server-first,
                precompiled CSS.
              </Text>
              <Button size="xs" variant="outline" colorScheme="gray">
                Follow
              </Button>
            </VStack>
          </HStack>
        </HoverCard.Content>
      </HoverCard>{" "}
      in the release notes.
    </Text>
  );
}
