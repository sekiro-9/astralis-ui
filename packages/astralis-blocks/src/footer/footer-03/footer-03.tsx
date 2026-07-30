import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Icon,
  Link,
  Separator,
  Stack,
  Text,
} from "astralis-ui";

const columns = [
  {
    heading: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap"],
  },
  {
    heading: "Developers",
    links: ["Docs", "API", "CLI", "Status"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Blog"],
  },
  {
    heading: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
];

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
const social = [
  {
    label: "GitHub",
    path: "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
  },
  {
    label: "X",
    path: "M18.9 2H22l-7.1 8.1L23.2 22h-6.5l-5.1-6.6L5.8 22H2.7l7.6-8.7L1.8 2h6.6l4.6 6.1L18.9 2Z",
  },
];

/**
 * Link takes Text's typography, so size and colour go straight on it — no
 * wrapping Text needed. `color="inverted"` holds in both states, so the
 * underline carries the hover instead of a colour shift, which is the right
 * affordance on a surface the accent channel does not cover.
 */
function FooterLink({ label }: { label: string }) {
  return (
    <Link href="#" size="sm" color="inverted" variant="hover">
      {label}
    </Link>
  );
}

/** Three tiers with the whole footer inverted to close the page. */
export function Footer03() {
  return (
    <Box as="footer" bg="inverted" py={{ base: "14", lg: "20" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "12", lg: "16" }}>
          <Grid
            columns={{ base: "1", sm: "2", lg: "6" }}
            gap={{ base: "10", lg: "8" }}
            alignItems="start"
          >
            <GridItem colSpan={{ base: "1", sm: "2" }}>
              <Stack direction="vertical" alignItems="start" gap="4">
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
                  <Text as="span" size="md" weight="semibold" color="inverted" letterSpacing="tight">
                    Astralis
                  </Text>
                </Flex>

                <Box maxW="2xs" opacity="high">
                  <Text size="sm" color="inverted" lineHeight="relaxed">
                    Accessible primitives and semantic tokens for teams who would
                    rather ship the product than the button.
                  </Text>
                </Box>
              </Stack>
            </GridItem>

            {columns.map((column) => (
              <Stack key={column.heading} direction="vertical" alignItems="start" gap="3">
                <Text as="span" size="sm" weight="semibold" color="inverted">
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
            {/* The rule has to invert too, or it disappears into the fill. */}
            <Separator borderColor="inverted" opacity="low" />
            <Flex
              direction={{ base: "column", sm: "row" }}
              alignItems={{ base: "start", sm: "center" }}
              justifyContent="between"
              gap="4"
            >
              <Box opacity="high">
                <Text size="sm" color="inverted">
                  © 2026 Astralis. All rights reserved.
                </Text>
              </Box>
              <Flex alignItems="center" gap="4">
                {social.map((item) => (
                  <Link
                    key={item.label}
                    href="#"
                    color="inverted"
                    variant="plain"
                    aria-label={item.label}
                  >
                    <Icon size="sm" color="inherit" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d={item.path} />
                      </svg>
                    </Icon>
                  </Link>
                ))}
              </Flex>
            </Flex>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
