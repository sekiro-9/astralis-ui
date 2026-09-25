import { HStack, Loader } from "astralis-ui";

export function LoaderSchemes() {
  return (
    <HStack gap="6" alignItems="center">
      <Loader size="lg" colorScheme="brand" />
      <Loader size="lg" colorScheme="blue" variant="dots" />
      <Loader size="lg" colorScheme="green" variant="bars" />
      <Loader size="lg" colorScheme="purple" variant="pulse" />
      <Loader size="lg" colorScheme="gray" variant="spinner" />
    </HStack>
  );
}
