import {
  Avatar,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
} from "astralis-ui";

const testimonials = [
  {
    quote:
      "Astralis is the first system where the design tokens and the code tokens are the same tokens. Nothing gets lost in translation.",
    name: "Lena Ortiz",
    role: "Principal Designer",
    company: "Foundry",
  },
  {
    quote:
      "We onboarded three new engineers last quarter and none of them asked how to theme a component. It's just props.",
    name: "Marcus Reid",
    role: "VP Engineering",
    company: "Tallwood",
  },
  {
    quote:
      "The moment the whole app re-themed from one seed, our brand team stopped filing tickets and started experimenting.",
    name: "Yuki Tanaka",
    role: "Brand Systems",
    company: "Hopper",
  },
];

/**
 * The same quote-card skeleton as grid-01, given a softer treatment: a tinted
 * band with raised (shadowed, borderless) cards, a decorative quotation glyph,
 * and the attribution moved up top. Three across from md.
 *
 * `raised` is exactly the role a shadowed card sits in — a layer floating above
 * the tinted band rather than drawn on it — so the cards take `bg="raised"`.
 */
export function Testimonials02() {
  return (
    <Box as="section" bg="subtle" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "10", lg: "14" }}>
          <Stack direction="vertical" alignItems="center" gap="4">
            <Text
              as="span"
              size="sm"
              weight="semibold"
              color="brand"
              casing="uppercase"
              letterSpacing="wider"
            >
              Loved by builders
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              align="center"
            >
              In the words of the people shipping it
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
                bg="raised"
                rounded="2xl"
                shadow="md"
                p={{ base: "6", lg: "8" }}
              >
                <Flex direction="column" alignItems="start" gap="5" h="full">
                  {/* Attribution up top for this treatment. */}
                  <Flex as="figcaption" alignItems="center" gap="3">
                    <Avatar name={item.name} size="md" />
                    <Stack direction="vertical" gap="0.5">
                      <Text as="span" size="sm" weight="medium">
                        {item.name}
                      </Text>
                      <Text as="span" size="sm" color="muted">
                        {item.role} · {item.company}
                      </Text>
                    </Stack>
                  </Flex>

                  {/* Oversized quotation mark, decorative — the brand hue marks
                      it as accent, not body copy. lineHeight="none" keeps it from
                      adding a tall line box above the quote. */}
                  <Text
                    as="span"
                    size="6xl"
                    weight="semibold"
                    color="brand"
                    lineHeight="none"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </Text>

                  <Box as="blockquote" flex="1">
                    <Text size={{ base: "md", lg: "lg" }} color="base" lineHeight="relaxed">
                      {item.quote}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
