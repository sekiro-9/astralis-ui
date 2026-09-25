import { HStack, Loader } from "astralis-ui";

export function LoaderSizes() {
  return (
    <HStack gap="6" alignItems="center">
      <Loader size="xs" />
      <Loader size="sm" />
      <Loader size="md" />
      <Loader size="lg" />
      <Loader size="xl" />
    </HStack>
  );
}
