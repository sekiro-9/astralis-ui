import { Heading, Text, VStack } from "astralis-ui";

export function HeadingLineHeight() {
  return (
    /* Two lines each: tight by default, the size's own with lineHeight="size". */
    <VStack gap="6" alignItems="start" maxW="xs">
      <VStack gap="1" alignItems="start">
        <Text size="xs" color="muted">Default (tight)</Text>
        <Heading size="xl">A section heading long enough to run to two lines</Heading>
      </VStack>
      <VStack gap="1" alignItems="start">
        <Text size="xs" color="muted">lineHeight=&quot;size&quot;</Text>
        <Heading size="xl" lineHeight="size">A section heading long enough to run to two lines</Heading>
      </VStack>
    </VStack>
  );
}
