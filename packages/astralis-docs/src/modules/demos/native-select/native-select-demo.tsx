import { NativeSelect, Box } from "astralis-ui";

export function NativeSelectDemo() {
  return (
    <Box w="full" maxW="xs">
      <NativeSelect placeholder="Pick a framework" aria-label="Framework">
        <option value="next">Next.js</option>
        <option value="remix">Remix</option>
        <option value="vite">Vite</option>
        <option value="astro">Astro</option>
      </NativeSelect>
    </Box>
  );
}
