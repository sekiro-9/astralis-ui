import { HStack, Loader, Text, VStack } from "astralis-ui";

const variants = ["blocks", "spinner", "dots", "bars", "pulse"] as const;

export function LoaderVariants() {
  return (
    <HStack gap="10" wrap="wrap" justifyContent="center">
      {variants.map((variant) => (
        <VStack key={variant} gap="3" alignItems="center">
          <Loader variant={variant} size="xl" />
          <Text size="xs" color="muted">
            {variant}
          </Text>
        </VStack>
      ))}
    </HStack>
  );
}
