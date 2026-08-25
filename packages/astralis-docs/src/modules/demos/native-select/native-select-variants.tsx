import { NativeSelect, VStack } from "astralis-ui";

export function NativeSelectVariants() {
  return (
    <VStack gap="4" w="full" maxW="xs" alignItems="stretch">
      <NativeSelect variant="outline" defaultValue="outline" aria-label="Outline variant">
        <option value="outline">Outline (default)</option>
      </NativeSelect>
      <NativeSelect variant="filled" defaultValue="filled" aria-label="Filled variant">
        <option value="filled">Filled</option>
      </NativeSelect>
      <NativeSelect invalid defaultValue="invalid" aria-label="Invalid state">
        <option value="invalid">Invalid</option>
      </NativeSelect>
      <NativeSelect disabled defaultValue="disabled" aria-label="Disabled state">
        <option value="disabled">Disabled</option>
      </NativeSelect>
    </VStack>
  );
}
