import { CopyButton, HStack } from "astralis-ui";

export function CopyButtonDemo() {
  return (
    <HStack gap="3">
      <CopyButton value="npm install astralis-ui" />
      <CopyButton value="https://astralis.dev" variant="outline" colorScheme="gray" size="sm">
        Copy link
      </CopyButton>
    </HStack>
  );
}
