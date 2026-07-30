import {
  Box,
  Button,
  CardBody,
  CardRoot,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  List,
  ListItem,
  Stack,
  Text,
} from "astralis-ui";

const features = [
  "Migrates your existing schema in one pass",
  "Point-in-time restore down to the second",
  "SOC 2 Type II, audited annually",
];

/** Blocks bundle no icon library — raw SVG through Icon's BYO path. */
function CheckIcon() {
  return (
    <Icon size="sm" color="brand-solid" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </Icon>
  );
}

/**
 * Two-column hero pairing a feature checklist with a testimonial card floating
 * over a brand-tinted panel. Stacks to one column below `lg`.
 */
export function Hero03() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Grid
          columns={{ base: "1", lg: "2" }}
          gap={{ base: "12", lg: "16" }}
          alignItems="center"
        >
          {/* ---------------------------------------------------------- */}
          {/* Copy                                                       */}
          {/* ---------------------------------------------------------- */}
          <Stack direction="vertical" alignItems="start" gap="6">
            <Text
              as="span"
              size="xs"
              weight="semibold"
              color="brand"
              casing="uppercase"
              letterSpacing="wider"
            >
              Managed Postgres
            </Text>

            <Heading
              as="h1"
              size={{ base: "4xl", lg: "5xl" }}
              weight="semibold"
              lineHeight="tight"
              letterSpacing="tight"
            >
              The database you stop thinking about
            </Heading>

            <Box maxW="lg">
              <Text size={{ base: "md", lg: "lg" }} color="muted" lineHeight="relaxed">
                Backups, failover and connection pooling handled. You get a URL and the
                same Postgres you already know.
              </Text>
            </Box>

            <List styleType="none" spacing="3">
              {features.map((feature) => (
                <ListItem key={feature} icon={<CheckIcon />}>
                  <Text color="muted">{feature}</Text>
                </ListItem>
              ))}
            </List>

            <Flex gap="4" wrap="wrap" alignItems="center" pt="2">
              <Button size="lg">Create a database</Button>
              <Button size="lg" variant="text" colorScheme="gray">
                Read the migration guide
              </Button>
            </Flex>
          </Stack>

          {/* ---------------------------------------------------------- */}
          {/* Testimonial over a tinted panel                            */}
          {/* ---------------------------------------------------------- */}
          <Box bg="brand-subtle" rounded="3xl" p={{ base: "6", lg: "10" }}>
            <CardRoot variant="elevated" size="lg">
              <CardBody>
                <Stack direction="vertical" gap="6">
                  <Text size="xl" lineHeight="relaxed">
                    &ldquo;We moved eleven services over on a Thursday afternoon. The part
                    I keep telling people about is that nothing happened.&rdquo;
                  </Text>

                  <Flex alignItems="center" gap="3">
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      size="10"
                      rounded="full"
                      bg="brand"
                    >
                      <Text size="sm" weight="semibold" color="brand-contrast">
                        RA
                      </Text>
                    </Flex>
                    <Box>
                      <Text size="sm" weight="semibold">
                        Rina Adeyemi
                      </Text>
                      <Text size="xs" color="muted">
                        Staff Engineer, Northwind
                      </Text>
                    </Box>
                  </Flex>
                </Stack>
              </CardBody>
            </CardRoot>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
