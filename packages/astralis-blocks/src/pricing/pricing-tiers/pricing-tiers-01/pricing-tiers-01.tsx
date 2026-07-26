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
  Separator,
  Stack,
  Text,
} from "astralis-ui";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "free forever",
    description: "Everything you need to ship a first project.",
    cta: "Start for free",
    featured: false,
    features: [
      "Up to 3 projects",
      "Community support",
      "1 GB asset storage",
      "Core component library",
    ],
  },
  {
    name: "Team",
    price: "$24",
    cadence: "per editor / month",
    description: "For teams shipping to production every week.",
    cta: "Start 14-day trial",
    featured: true,
    features: [
      "Unlimited projects",
      "Priority support",
      "100 GB asset storage",
      "Shared design tokens",
      "Role-based permissions",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "billed annually",
    description: "Procurement, security review and an SLA.",
    cta: "Talk to sales",
    featured: false,
    features: [
      "Everything in Team",
      "SSO and SCIM",
      "Dedicated environment",
      "99.9% uptime SLA",
    ],
  },
];

/** Blocks bundle no icon library — raw SVG through Icon's BYO path. */
function CheckMark() {
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

/** Three separate cards, the recommended plan lifted with a brand border. */
export function PricingTiers01() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "10", lg: "14" }}>
          {/* ---- Section heading ---- */}
          <Stack direction="vertical" alignItems="center" gap="3">
            <Text
              as="span"
              size="xs"
              weight="semibold"
              color="brand"
              casing="uppercase"
              letterSpacing="wider"
            >
              Pricing
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              lineHeight="tight"
              letterSpacing="tight"
              align="center"
            >
              Priced per editor, not per seat
            </Heading>
            <Box maxW="xl">
              <Text size="md" color="muted" align="center" lineHeight="relaxed">
                Viewers are always free. You only pay for the people actually pushing
                changes, and you can change plan whenever you like.
              </Text>
            </Box>
          </Stack>

          {/* ---- Tiers ---- */}
          <Grid columns={{ base: "1", lg: "3" }} gap="6" alignItems="stretch">
            {tiers.map((tier) => (
              <Box
                key={tier.name}
                bg="subtle"
                border={tier.featured ? "moderate" : "normal"}
                borderColor={tier.featured ? "brand" : "base"}
                rounded="2xl"
                shadow={tier.featured ? "lg" : "sm"}
                p={{ base: "6", lg: "8" }}
              >
                <Stack direction="vertical" alignItems="stretch" gap="6" h="full">
                  <Stack direction="vertical" alignItems="stretch" gap="4">
                    <Flex alignItems="center" justifyContent="between" gap="3">
                      <Heading as="h3" size="lg" weight="semibold">
                        {tier.name}
                      </Heading>
                      {tier.featured && (
                        <Badge variant="solid" colorScheme="brand" size="xs">
                          Most popular
                        </Badge>
                      )}
                    </Flex>

                    <Flex alignItems="baseline" gap="2" wrap="wrap">
                      <Text as="span" size="4xl" weight="semibold" lineHeight="none">
                        {tier.price}
                      </Text>
                      <Text as="span" size="sm" color="muted">
                        {tier.cadence}
                      </Text>
                    </Flex>

                    <Text size="sm" color="muted" lineHeight="relaxed">
                      {tier.description}
                    </Text>
                  </Stack>

                  <Separator />

                  {/* The list absorbs the card's slack so the button is pinned
                      to the bottom. Placed above the button rather than below
                      it, the CTAs would only line up while every tier happened
                      to have the same number of features. */}
                  <List grow="1" styleType="none" spacing="3">
                    {tier.features.map((feature) => (
                      <ListItem key={feature} icon={<CheckMark />}>
                        <Text size="sm" color="muted">
                          {feature}
                        </Text>
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

          <Text size="sm" color="subtle" align="center">
            All plans include unlimited viewers, SSL and a 30-day money-back guarantee.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
