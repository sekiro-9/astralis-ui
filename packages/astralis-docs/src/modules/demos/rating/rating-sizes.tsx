import { Rating, VStack } from "astralis-ui";

export function RatingSizes() {
  return (
    <VStack gap="3" alignItems="start">
      <Rating size="sm" defaultValue={3} label="Small rating" />
      <Rating size="md" defaultValue={3} label="Medium rating" />
      <Rating size="lg" defaultValue={3} label="Large rating" />
    </VStack>
  );
}
