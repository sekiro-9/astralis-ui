import { Box, Link } from "astralis-ui";

export function LinkLineClamp() {
  return (
    <Box maxW="xs">
      <Link href="/docs/theming" lineClamp="2" weight="medium">
        Theming Astralis for a brand that ships light and dark palettes, runtime accent
        colors and per-component overrides
      </Link>
    </Box>
  );
}
