import {
  Box,
  Button,
  Container,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Input,
  Link,
  Separator,
  Stack,
  Text,
} from "astralis-ui";

const columns = [
  {
    heading: "Platform",
    links: ["Overview", "Workflows", "Analytics", "Enterprise"],
  },
  {
    heading: "Resources",
    links: ["Documentation", "Guides", "Support", "Community"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
];

const legal = ["Privacy", "Terms", "Cookies"];

function FooterLink({ label }: { label: string }) {
  return (
    <Link href="#" colorScheme="gray" variant="plain" size="sm">
      {label}
    </Link>
  );
}

/**
 * Newsletter capture on the left, three link columns on the right. The capture
 * spans two of five columns so the form keeps a usable width before the grid
 * collapses at `lg`.
 */
export function Footer02() {
  return (
    <Box as="footer" bg="base" py={{ base: "14", lg: "20" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "12", lg: "16" }}>
          <Grid
            columns={{ base: "1", sm: "3", lg: "5" }}
            gap={{ base: "10", lg: "8" }}
            alignItems="start"
          >
            {/* ---- Brand + newsletter ---- */}
            <GridItem colSpan={{ base: "1", sm: "3", lg: "2" }}>
              <Stack direction="vertical" alignItems="start" gap="5">
                <Flex alignItems="center" gap="2.5">
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    shrink="0"
                    size="8"
                    rounded="lg"
                    bg="brand"
                  >
                    <Text as="span" size="sm" weight="semibold" color="brand-contrast">
                      A
                    </Text>
                  </Flex>
                  <Text as="span" size="md" weight="semibold" letterSpacing="tight">
                    Astralis
                  </Text>
                </Flex>

                <Stack direction="vertical" alignItems="start" gap="3">
                  <Text size="sm" weight="semibold">
                    Changelog, monthly
                  </Text>
                  <Box maxW="xs">
                    <Text size="sm" color="muted" lineHeight="relaxed">
                      What shipped, what broke and what we learned. No launch
                      announcements from other companies.
                    </Text>
                  </Box>
                </Stack>

                {/* Wire this to your own handler — it posts nowhere as written. */}
                <Flex as="form" gap="2" wrap="wrap" w="full" maxW="sm">
                  {/* Input carries no style props, so the wrapper does the growing. */}
                  <FlexItem flex="1" minW="40">
                    <Input
                      type="email"
                      name="email"
                      size="md"
                      placeholder="you@company.com"
                      aria-label="Email address"
                      required
                    />
                  </FlexItem>
                  <Button type="submit" size="md">
                    Subscribe
                  </Button>
                </Flex>
              </Stack>
            </GridItem>

            {/* ---- Link columns ---- */}
            {columns.map((column) => (
              <Stack key={column.heading} direction="vertical" alignItems="start" gap="3">
                <Text as="span" size="sm" weight="semibold">
                  {column.heading}
                </Text>
                <Stack as="ul" direction="vertical" alignItems="start" gap="2.5">
                  {column.links.map((label) => (
                    <Box as="li" key={label}>
                      <FooterLink label={label} />
                    </Box>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Grid>

          <Stack direction="vertical" alignItems="stretch" gap="6">
            <Separator />
            <Flex
              direction={{ base: "column", sm: "row" }}
              alignItems={{ base: "start", sm: "center" }}
              justifyContent="between"
              gap="4"
            >
              <Text size="sm" color="subtle">
                © 2026 Astralis Labs Ltd.
              </Text>
              <Flex alignItems="center" gap="5" wrap="wrap">
                {legal.map((label) => (
                  <FooterLink key={label} label={label} />
                ))}
              </Flex>
            </Flex>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
