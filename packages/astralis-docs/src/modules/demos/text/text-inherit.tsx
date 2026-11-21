import { Text, VStack } from "astralis-ui";

export function TextInherit() {
  return (
    <VStack gap="3" alignItems="start">
      <Text size="sm" color="muted">
        Small print with one <Text as="strong" size="inherit" color="base">bold word</Text> that stays small.
      </Text>
      <Text size="lg">
        Larger copy, and the <Text as="em" size="inherit" fontStyle="italic">emphasis</Text> follows it.
      </Text>
    </VStack>
  );
}
