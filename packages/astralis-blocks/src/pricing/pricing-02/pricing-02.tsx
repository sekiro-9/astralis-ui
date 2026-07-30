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
    name: "Hobby",
    price: "$0",
    cadence: "/ month",
    description: "For side projects and prototypes.",
    cta: "Get started",
    featured: false,
    features: ["1 workspace", "5 GB bandwidth", "Community support"],
  },
  {
    name: "Pro",
    price: "$18",
    cadence: "/ month",
    description: "For freelancers shipping client work.",
    cta: "Choose Pro",
    featured: true,
    features: [
      "10 workspaces",
      "500 GB bandwidth",
      "Email support in 24h",
      "Custom domains",
    ],
  },
  {
    name: "Studio",
    price: "$64",
    cadence: "/ month",
    description: "For agencies running many clients.",
    cta: "Choose Studio",
    featured: false,
    features: ["Unlimited workspaces", "2 TB bandwidth", "Shared billing"],
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

/**
 * The same three tiers as one joined panel rather than floating cards. The
 * recommended column is marked by a tinted background instead of a border, so
 * nothing breaks the outer silhouette.
 */
export function Pricing02() {
  return (
    <Box as="section" bg="subtle" py={{ base: "16", lg: "24" }}>
      <Container maxW="5xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "10", lg: "12" }}>
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
              Simple plans, no surprises
            </Heading>
            <Box maxW="lg">
              <Text size="md" color="muted" align="center" lineHeight="relaxed">
                Every plan bills monthly and cancels in one click. Move up or down
                whenever the work changes.
              </Text>
            </Box>
          </Stack>

          {/* ---- Joined panel ----
              One rounded, clipped container; the columns sit flush inside it
              with no gap, so the panel reads as a single object. */}
          <Box
            bg="base"
            border="normal"
            borderColor="base"
            rounded="2xl"
            shadow="sm"
            overflow="hidden"
          >
            {/* No `gap` prop at all: the spacing scale starts at 0.5, so there
                is no zero token — omitting it leaves CSS's `normal`, which is
                0 for grid, and the columns sit flush. */}
            <Grid columns={{ base: "1", lg: "3" }} alignItems="stretch">
              {tiers.map((tier) => (
                <Box
                  key={tier.name}
                  bg={tier.featured ? "subtle" : "transparent"}
                  p={{ base: "6", lg: "8" }}
                >
                  <Stack direction="vertical" alignItems="stretch" gap="5" h="full">
                    <Flex alignItems="center" gap="2">
                      <Heading as="h3" size="md" weight="semibold">
                        {tier.name}
                      </Heading>
                      {tier.featured && (
                        <Badge variant="subtle" colorScheme="brand" size="xs">
                          Recommended
                        </Badge>
                      )}
                    </Flex>

                    <Flex alignItems="baseline" gap="1">
                      <Text as="span" size="3xl" weight="semibold" lineHeight="none">
                        {tier.price}
                      </Text>
                      <Text as="span" size="sm" color="muted">
                        {tier.cadence}
                      </Text>
                    </Flex>

                    <Text size="sm" color="muted" lineHeight="relaxed">
                      {tier.description}
                    </Text>

                    {/* The list absorbs the column's slack so the button is
                        pinned to the bottom. Without it the buttons sit
                        wherever each feature list happens to end, and tiers
                        with different feature counts step out of line. */}
                    <List grow="1" styleType="none" spacing="2.5">
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
                      variant={tier.featured ? "solid" : "outline"}
                      colorScheme={tier.featured ? "brand" : "gray"}
                    >
                      {tier.cta}
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
