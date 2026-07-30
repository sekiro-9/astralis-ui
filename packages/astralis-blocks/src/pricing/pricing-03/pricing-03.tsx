import {
  Badge,
  Box,
  Button,
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

const tiers = [
  {
    name: "Basic",
    price: "$12",
    note: "billed annually",
    description: "One project, one collaborator.",
    cta: "Choose Basic",
    featured: false,
    features: ["1 project", "2 GB storage", "Weekly backups"],
  },
  {
    name: "Growth",
    price: "$39",
    note: "billed annually · save 20%",
    description: "The plan most teams settle on.",
    cta: "Choose Growth",
    featured: true,
    features: [
      "10 projects",
      "50 GB storage",
      "Hourly backups",
      "Audit log",
      "Priority support",
    ],
  },
  {
    name: "Scale",
    price: "$99",
    note: "billed annually",
    description: "High volume, with room to grow.",
    cta: "Choose Scale",
    featured: false,
    features: ["Unlimited projects", "1 TB storage", "Continuous backups"],
  },
];

/**
 * Blocks bundle no icon library — raw SVG through Icon's BYO path. The tick
 * takes its colour from the card so it reads on both surfaces.
 */
function CheckMark({ inverted }: { inverted?: boolean }) {
  return (
    <Icon size="sm" color={inverted ? "inverted" : "brand-solid"} aria-hidden="true">
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

/** Three tiers with the recommended plan inverted to carry the most weight. */
export function Pricing03() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "10", lg: "14" }}>
          {/* ---- Section heading ---- */}
          <Stack direction="vertical" alignItems="center" gap="3">
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              lineHeight="tight"
              letterSpacing="tight"
              align="center"
            >
              Pay yearly, keep a fifth of it
            </Heading>
            <Box maxW="lg">
              <Text size="md" color="muted" align="center" lineHeight="relaxed">
                Annual billing is 20% cheaper on every plan. Monthly is available at
                checkout if you would rather not commit.
              </Text>
            </Box>
          </Stack>

          {/* ---- Tiers ---- */}
          <Grid columns={{ base: "1", lg: "3" }} gap="6" alignItems="stretch">
            {tiers.map((tier) => (
              <Box
                key={tier.name}
                bg={tier.featured ? "inverted" : "subtle"}
                border="normal"
                borderColor={tier.featured ? "inverted" : "base"}
                rounded="2xl"
                shadow={tier.featured ? "xl" : "sm"}
                p={{ base: "6", lg: "8" }}
              >
                <Stack direction="vertical" alignItems="stretch" gap="6" h="full">
                  <Stack direction="vertical" alignItems="stretch" gap="4">
                    <Flex alignItems="center" justifyContent="between" gap="3">
                      <Heading
                        as="h3"
                        size="md"
                        weight="semibold"
                        color={tier.featured ? "inverted" : "base"}
                      >
                        {tier.name}
                      </Heading>
                      {tier.featured && (
                        <Badge variant="solid" colorScheme="brand" size="xs">
                          Best value
                        </Badge>
                      )}
                    </Flex>

                    <Stack direction="vertical" alignItems="stretch" gap="1">
                      <Text
                        as="span"
                        size="5xl"
                        weight="semibold"
                        lineHeight="none"
                        color={tier.featured ? "inverted" : "base"}
                      >
                        {tier.price}
                      </Text>
                      {/* No inverted-muted token exists, so secondary text on the
                          inverted card is the inverted label held back with opacity. */}
                      <Box opacity={tier.featured ? "high" : "max"}>
                        <Text size="xs" color={tier.featured ? "inverted" : "subtle"}>
                          {tier.note}
                        </Text>
                      </Box>
                    </Stack>

                    <Box opacity={tier.featured ? "high" : "max"}>
                      <Text
                        size="sm"
                        color={tier.featured ? "inverted" : "muted"}
                        lineHeight="relaxed"
                      >
                        {tier.description}
                      </Text>
                    </Box>
                  </Stack>

                  {/* The list absorbs the card's slack so the button is pinned
                      to the bottom — the tiers carry 3, 5 and 3 features, so
                      anything else steps the CTAs out of line. */}
                  <List grow="1" styleType="none" spacing="3">
                    {tier.features.map((feature) => (
                      <ListItem key={feature} icon={<CheckMark inverted={tier.featured} />}>
                        <Box opacity={tier.featured ? "high" : "max"}>
                          <Text size="sm" color={tier.featured ? "inverted" : "muted"}>
                            {feature}
                          </Text>
                        </Box>
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    size="md"
                    fullWidth
                    variant={tier.featured ? "solid" : "surface"}
                    colorScheme={tier.featured ? "brand" : "gray"}
                  >
                    {tier.cta}
                  </Button>
                </Stack>
              </Box>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
