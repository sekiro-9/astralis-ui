import { Input, VStack } from "astralis-ui";

export function InputRounded() {
  return (
    <VStack gap="4" alignItems="stretch" w="full" maxW="xs">
      <Input rounded="none" placeholder="None" />
      <Input rounded="md" placeholder="Medium" />
      <Input rounded="full" placeholder="Full" />
      <Input.Search rounded="full" placeholder="Search products" showSearchButton />
    </VStack>
  );
}
