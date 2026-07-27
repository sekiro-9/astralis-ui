import { Flex, Box, Text, Button } from "astralis-ui";

export function FlexDemo() {
  return (
    <Flex
      justifyContent="between"
      alignItems="center"
      gap="4"
      w="full"
      maxW="lg"
      bg="subtle"
      p="4"
      rounded="xl"
      border="normal"
      borderColor="base"
    >
      <Flex alignItems="center" gap="3">
        <Box size="10" bg="brand" rounded="full" />
        <Box>
          <Text size="sm" weight="semibold">Nova Starling</Text>
          <Text size="xs" color="muted">Product designer</Text>
        </Box>
      </Flex>
      <Button size="sm" variant="outline" colorScheme="gray">
        Follow
      </Button>
    </Flex>
  );
}
