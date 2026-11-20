import NextLink from "next/link";
import { Box, Flex, Stack, Text } from "astralis-ui";
import { Logo } from "@/modules/site/logo";
import { NavGroupLabel } from "@/modules/site/nav-item";
import { GITHUB_URL } from "@/modules/site/nav-links";

const columns = [
  {
    title: "Docs",
    links: [
      { label: "Introduction", href: "/docs" },
      { label: "Components", href: "/docs/components/button" },
      { label: "Theming", href: "/docs/theming" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "CLI", href: "/docs/cli" },
      { label: "Blocks", href: "/blocks" },
      { label: "Theme builder", href: "/theme-builder" },
      { label: "AI assistants", href: "/docs/ai-agents" },
      { label: "DevTools", href: "/docs/devtools" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Issues & contributions", href: "/issues" },
      { label: "GitHub", href: GITHUB_URL },
    ],
  },
];

export function Footer({ version }: { version: string }) {
  return (
    <Box as="footer" borderT="normal" borderColor="base">
      <Flex
        mx="auto"
        maxW="7xl"
        direction={{ base: "column", sm: "row" }}
        justifyContent={{ sm: "between" }}
        gap="12"
        px={{ base: "6", lg: "12" }}
        py="20"
      >
        <Box maxW="xs">
          <Logo />
          <Text mt="4" size="sm" lineHeight="relaxed" color="muted">
            A React component library with a stellar finish: semantic tokens,
            runtime theming, zero build step.
          </Text>
        </Box>
        <Flex wrap="wrap" columnGap="16" rowGap="10">
          {columns.map((column) => (
            <Box key={column.title}>
              <NavGroupLabel mb="3">{column.title}</NavGroupLabel>
              <Stack as="ul" gap="2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {/* A Box, not Link: Link takes no hover colour. */}
                    <Box as={NextLink} href={link.href} color="muted" hover={{ color: "base" }} className="transition-colors">
                      <Text as="span" size="sm">
                        {link.label}
                      </Text>
                    </Box>
                  </li>
                ))}
              </Stack>
            </Box>
          ))}
        </Flex>
      </Flex>
      <Box borderT="normal" borderColor="base">
        <Flex
          mx="auto"
          maxW="7xl"
          alignItems="center"
          justifyContent="between"
          px={{ base: "6", lg: "12" }}
          py="6"
          color="subtle"
        >
          <Text as="span" size="xs">© 2026 Astralis UI</Text>
          <Text as="span" size="xs">astralis-ui v{version} · MIT</Text>
        </Flex>
      </Box>
    </Box>
  );
}
