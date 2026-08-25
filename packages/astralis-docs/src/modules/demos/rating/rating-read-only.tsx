import { Rating, HStack, Text } from "astralis-ui";

export function RatingReadOnly() {
  return (
    <HStack gap="3">
      <Rating value={4.5} readOnly />
      <Text size="sm" color="muted">
        4.5 · 1,238 reviews
      </Text>
    </HStack>
  );
}
