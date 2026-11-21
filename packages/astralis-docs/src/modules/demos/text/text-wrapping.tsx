import { Flex, Text, VStack } from "astralis-ui";

export function TextWrapping() {
  return (
    <VStack gap="6" alignItems="start" maxW="sm">
      {/* balance evens out the lines of a short title. */}
      <VStack gap="1" alignItems="start">
        <Text size="xs" color="muted">textWrap=&quot;balance&quot;</Text>
        <Text size="xl" weight="semibold" textWrap="balance">
          Every component here renders on the server first
        </Text>
      </VStack>
      {/* tabular gives every digit the same width, so the column lines up. */}
      <Flex gap="10">
        {(["normal", "tabular"] as const).map((numeric) => (
          <VStack key={numeric} gap="1" alignItems="end">
            <Text size="xs" color="muted">numeric=&quot;{numeric}&quot;</Text>
            {["1,111.11", "8,808.80", "41.17"].map((amount) => (
              <Text key={amount} numeric={numeric}>{amount}</Text>
            ))}
          </VStack>
        ))}
      </Flex>
      {/* pre-wrap keeps the text's own line breaks. */}
      <VStack gap="1" alignItems="start">
        <Text size="xs" color="muted">whiteSpace=&quot;pre-wrap&quot;</Text>
        <Text size="sm" whiteSpace="pre-wrap">{"Line one\nLine two, kept as written"}</Text>
      </VStack>
    </VStack>
  );
}
