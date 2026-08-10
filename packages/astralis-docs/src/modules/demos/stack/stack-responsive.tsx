import { Stack, Box, Text } from "astralis-ui";

export function StackResponsive() {
  return (
    /* Resize the window: vertical below md, horizontal from md up. */
    <Stack
      direction={{ base: "vertical", md: "horizontal" }}
      gap="3"
      w="full"
      maxW="md"
    >
      <Box bg="cyan-subtle" px="4" py="3" rounded="lg">
        <Text size="xs">One</Text>
      </Box>
      <Box bg="cyan-muted" px="4" py="3" rounded="lg">
        <Text size="xs">Two</Text>
      </Box>
      <Box bg="cyan-muted" px="4" py="3" rounded="lg">
        <Text size="xs">Three</Text>
      </Box>
    </Stack>
  );
}
