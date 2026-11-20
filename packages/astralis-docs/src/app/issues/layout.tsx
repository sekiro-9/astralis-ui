import { Box } from "astralis-ui";

/**
 * The issues sit outside /docs, like the block gallery: their lists
 * and snapshots need more width than the docs article column. The container
 * matches the gallery's, so every top-level page starts on the same edge.
 */
export default function IssuesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box as="main" mx="auto" maxW="7xl" px={{ base: "6", lg: "12" }} py={{ base: "12", lg: "16" }}>
      {children}
    </Box>
  );
}
