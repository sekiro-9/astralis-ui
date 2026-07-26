import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Stack,
  Text,
} from "astralis-ui";

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.75",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function SyncIcon() {
  return (
    <svg {...stroke}>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" />
      <path d="M20 4v4h-4M4 20v-4h4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...stroke}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg {...stroke}>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg {...stroke}>
      <path d="M9 3v5M15 3v5" />
      <path d="M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8Z" />
      <path d="M12 17v4" />
    </svg>
  );
}

const features = [
  {
    icon: <SyncIcon />,
    title: "Realtime sync",
    body: "Changes land for everyone in the room before the keystroke finishes. Conflict resolution is per-field, so two people can edit one record without a merge dialog.",
    badge: null,
  },
  {
    icon: <LockIcon />,
    title: "Granular permissions",
    body: "Roles down to the field. Give finance the numbers and support the notes, from the same table, without duplicating a thing.",
    badge: null,
  },
  {
    icon: <ChartIcon />,
    title: "Usage analytics",
    body: "Every query, mutation and webhook charted by route. Find the endpoint that got slow last Tuesday without adding a tracing library.",
    badge: null,
  },
  {
    icon: <PlugIcon />,
    title: "Anything as a source",
    body: "Postgres, S3, a CSV someone emailed you. Connect it once and it behaves like a native table everywhere else in the product.",
    badge: "Beta",
  },
];

/**
 * Four features as bordered cards on a tinted band. The section heading sits
 * left with its call to action opposite, and each card runs its icon inline
 * beside the title. Two across from `md`, one below it.
 */
export function FeaturesGrid02() {
  return (
    <Box as="section" bg="subtle" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "10", lg: "14" }}>
          {/* ---------------------------------------------------------- */}
          {/* Heading, with the CTA opposite on wide viewports           */}
          {/* ---------------------------------------------------------- */}
          <Flex
            direction={{ base: "column", lg: "row" }}
            alignItems={{ base: "start", lg: "end" }}
            justifyContent="between"
            gap={{ base: "6", lg: "10" }}
          >
            <Stack direction="vertical" alignItems="start" gap="3">
              <Text
                as="span"
                size="xs"
                weight="semibold"
                color="brand"
                casing="uppercase"
                letterSpacing="wider"
              >
                Platform
              </Text>
              <Heading
                as="h2"
                size={{ base: "3xl", lg: "4xl" }}
                weight="semibold"
                lineHeight="tight"
                letterSpacing="tight"
              >
                Built for the team, not the demo
              </Heading>
              <Box maxW="xl">
                <Text size="md" color="muted" lineHeight="relaxed">
                  The features that only matter once real people depend on the thing —
                  and the ones most tools leave until version two.
                </Text>
              </Box>
            </Stack>

            <Button size="md" variant="surface" colorScheme="gray">
              Browse all features
            </Button>
          </Flex>

          {/* ---------------------------------------------------------- */}
          {/* Feature cards                                              */}
          {/* ---------------------------------------------------------- */}
          <Grid columns={{ base: "1", md: "2" }} gap="6" alignItems="stretch">
            {features.map((feature) => (
              // `base` fill on a `subtle` band — the nesting rule, one level
              // down. A transparent card would sit at the same value as the
              // band and read as a hairline box; a shadow on a tint reads as
              // grime, so the border does the separating.
              <Box
                key={feature.title}
                bg="base"
                border="normal"
                borderColor="base"
                rounded="xl"
                p={{ base: "6", lg: "7" }}
              >
                <Flex alignItems="start" gap="4">
                  {/* shrink="0" — the tile holds its width against the copy
                      on a narrow card. */}
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    shrink="0"
                    size="10"
                    bg="brand-subtle"
                    rounded="lg"
                  >
                    <Icon size="sm" color="brand-solid" aria-hidden="true">
                      {feature.icon}
                    </Icon>
                  </Flex>

                  <Stack direction="vertical" alignItems="start" gap="2">
                    <Flex alignItems="center" gap="2" wrap="wrap">
                      <Heading as="h3" size="md" weight="semibold">
                        {feature.title}
                      </Heading>
                      {feature.badge && (
                        <Badge variant="subtle" colorScheme="brand" size="xs">
                          {feature.badge}
                        </Badge>
                      )}
                    </Flex>

                    <Text size="sm" color="muted" lineHeight="relaxed">
                      {feature.body}
                    </Text>
                  </Stack>
                </Flex>
              </Box>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
