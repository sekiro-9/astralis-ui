import {
  Avatar,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Stack,
  Text,
} from "astralis-ui";

const testimonials = [
  {
    quote:
      "The migration paid for itself in the first sprint. We deleted more CSS than we wrote, and nothing regressed.",
    name: "Hannah Cole",
    role: "Engineering Lead, Bright",
  },
  {
    quote:
      "Every component we needed was already there, already accessible, already themeable. It felt like cheating.",
    name: "Omar Haddad",
    role: "Founder, Stacksmith",
  },
  {
    quote:
      "Our contrast and focus bugs went to zero. The defaults are the accessibility review.",
    name: "Ingrid Voss",
    role: "Accessibility Lead, Cartogram",
  },
];

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
function StarRow() {
  return (
    <Flex gap="0.5" aria-label="Rated 5 out of 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} size="sm" color="yellow-solid" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.6 9.3l6.5-.9L12 2.5Z" />
          </svg>
        </Icon>
      ))}
    </Flex>
  );
}

/**
 * The quote-card skeleton on an inverted closing band — the heading inverts
 * with the surface, and the cards flip to the light base surface so they read
 * as spotlights against the dark. Inside a light card the normal label ladder
 * applies, so the attribution needs no inverted handling. Three across from md.
 */
export function Testimonials03() {
  return (
    <Box as="section" bg="inverted" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "10", lg: "14" }}>
          <Stack direction="vertical" alignItems="center" gap="4">
            <Text
              as="span"
              size="sm"
              weight="semibold"
              color="inverted"
              casing="uppercase"
              letterSpacing="wider"
            >
              Why teams switch
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              color="inverted"
              align="center"
            >
              The last component library you'll migrate to
            </Heading>
          </Stack>

          <Grid
            columns={{ base: "1", md: "3" }}
            gap={{ base: "5", lg: "6" }}
            alignItems="stretch"
          >
            {testimonials.map((item) => (
              <Box
                key={item.name}
                as="figure"
                bg="base"
                rounded="2xl"
                p={{ base: "6", lg: "7" }}
              >
                <Flex direction="column" alignItems="start" gap="5" h="full">
                  <StarRow />

                  <Box as="blockquote" flex="1">
                    <Text size="md" color="base" lineHeight="relaxed">
                      {item.quote}
                    </Text>
                  </Box>

                  <Flex
                    as="figcaption"
                    alignItems="center"
                    gap="3"
                    w="full"
                    pt="5"
                    borderT="normal"
                    borderColor="subtle"
                  >
                    <Avatar name={item.name} size="md" />
                    <Stack direction="vertical" gap="0.5">
                      <Text as="span" size="sm" weight="medium">
                        {item.name}
                      </Text>
                      <Text as="span" size="sm" color="muted">
                        {item.role}
                      </Text>
                    </Stack>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
