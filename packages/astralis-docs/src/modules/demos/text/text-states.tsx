import { HStack, Link, Text } from "astralis-ui";

export function TextStates() {
  return (
    <HStack gap="6" wrap="wrap">
      <Link href="#" color="muted" hover={{ color: "base" }} variant="plain">
        Muted link, base on hover
      </Link>
      <Text as="span" color="subtle" hover={{ color: "red" }}>
        Text that turns red on hover
      </Text>
    </HStack>
  );
}
