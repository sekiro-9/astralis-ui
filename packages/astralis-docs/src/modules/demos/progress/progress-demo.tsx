import { Progress, VStack } from "astralis-ui";

export function ProgressDemo() {
  return (
    <VStack gap="5" alignItems="stretch" w="full" maxW="md">
      <Progress value={30} size="sm" />
      <Progress value={62} showValueLabel />
      <Progress value={88} size="lg" colorScheme="green" />
      <Progress />
    </VStack>
  );
}
