import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
} from "astralis-ui";

const assurances = ["Free for 14 days", "No credit card", "Cancel anytime"];

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
function CheckMark() {
  return (
    <Icon size="xs" color="brand" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 12.5 5.5 5.5L20 6.5" />
      </svg>
    </Icon>
  );
}

/**
 * Centred closing panel: eyebrow badge, headline, one line of copy, a pair of
 * actions, then the small print that answers the objection the button raises.
 *
 * The panel is a tinted surface with a border rather than a shadow — it sits
 * *on* the page rather than floating above it, which is what `raised` would
 * claim. The section keeps `bg="base"` so the panel has something to sit on.
 */
export function Cta01() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      {/* A closing panel wants a narrower measure than a hero: the copy is one
          sentence and the actions belong under it, not beside it. */}
      <Container maxW="4xl" px={{ base: "6", lg: "8" }}>
        <Box
          bg="subtle"
          border="normal"
          borderColor="base"
          rounded="3xl"
          p={{ base: "8", sm: "12", lg: "16" }}
        >
          <Stack direction="vertical" alignItems="center" gap="7">
            <Badge variant="surface" colorScheme="brand" size="sm">
              v1.0 is out
            </Badge>

            <Stack direction="vertical" alignItems="center" gap="4">
              <Heading
                as="h2"
                size={{ base: "3xl", lg: "4xl" }}
                weight="semibold"
                align="center"
              >
                Start with the tokens, not the tickets
              </Heading>

              {/* Measure lives on the layout primitive — Text exposes only its
                  own typography recipe, not Box's style props. */}
              <Box maxW="xl">
                <Text
                  size={{ base: "md", lg: "lg" }}
                  color="muted"
                  align="center"
                  lineHeight="relaxed"
                >
                  One theme seed repaints every surface you build. Install the
                  package, pick a palette, and ship the product instead of the
                  button.
                </Text>
              </Box>
            </Stack>

            {/* Stacked actions below sm, where two buttons side by side each get
                too narrow to read. */}
            <Flex
              direction={{ base: "column", sm: "row" }}
              alignItems="center"
              justifyContent="center"
              gap="3"
            >
              <Button size="lg">Start building</Button>
              <Button size="lg" variant="surface" colorScheme="gray">
                Book a walkthrough
              </Button>
            </Flex>

            <Flex justifyContent="center" gap={{ base: "4", sm: "6" }} wrap="wrap">
              {assurances.map((assurance) => (
                <Flex key={assurance} alignItems="center" gap="1.5">
                  <CheckMark />
                  <Text as="span" size="sm" color="muted">
                    {assurance}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
