import { Box } from "astralis-ui";

/**
 * Blocks live outside /docs on purpose: the docs layout caps its article at
 * 48rem, and a page section previewed in a 48rem column is a lie.
 *
 * The container mirrors the landing sections (80rem wide, 1.5rem gutter, 3rem
 * from `lg`) so the gallery starts on the same left edge as the rest of the
 * site rather than hugging the header's wider gutter.
 */
export default function BlocksLayout({
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
