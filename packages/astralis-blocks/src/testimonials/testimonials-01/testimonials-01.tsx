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
      "We swapped our home-grown components for Astralis in an afternoon. The theme seed meant every screen repainted to our brand without a single override.",
    name: "Mara Feld",
    role: "Staff Engineer, Northwind",
  },
  {
    quote:
      "The accessible defaults are the real story. Focus rings, contrast, keyboard handling — all correct out of the box, so our audit came back clean.",
    name: "Diego Salas",
    role: "Design Lead, Kepler",
  },
  {
    quote:
      "Semantic tokens instead of hex values changed how our designers and engineers talk. We ship the same vocabulary now.",
    name: "Priya Nair",
    role: "Head of Product, Loom Labs",
  },
  {
    quote:
      "Zero runtime CSS was the reason we tried it and the docs are the reason we stayed. Every prop I reached for already existed.",
    name: "Tom Becker",
    role: "Frontend Engineer, Cargo",
  },
  {
    quote:
      "One palette change and the whole dashboard went dark-mode ready. No hunting through stylesheets, no regressions.",
    name: "Aïcha Benali",
    role: "Engineering Manager, Vela",
  },
  {
    quote:
      "It reads like a design system that was actually used to build something, not a gallery of knobs. That's rare.",
    name: "Sam Whitfield",
    role: "CTO, Perch",
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
 * A three-column wall of bordered quote cards on the base surface. Each card is
 * a flex column so the attribution pins to the bottom on a divider, keeping the
 * footers aligned across a row even when the quotes differ in length.
 *
 * Card takes placement props now, so it can be stretched from the outside —
 * but its root is still not a flex column and its body cannot grow, so the
 * footer would float instead of pinning. That's why these are Boxes. See item
 * E in reports/astralis-api-updates.md — it's an open design decision, not an
 * oversight.
 */
export function Testimonials01() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "10", lg: "14" }}>
          {/* ---- Heading ---- */}
          <Stack direction="vertical" alignItems="center" gap="4">
            <Text
              as="span"
              size="sm"
              weight="semibold"
              color="brand"
              casing="uppercase"
              letterSpacing="wider"
            >
              Testimonials
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              align="center"
            >
              Teams ship faster on Astralis
            </Heading>
            <Box maxW="xl">
              <Text size={{ base: "md", lg: "lg" }} color="muted" align="center" lineHeight="relaxed">
                A design system that stays out of the way — accessible primitives,
                one theme seed, no runtime styling.
              </Text>
            </Box>
          </Stack>

          {/* ---- Grid ---- */}
          <Grid
            columns={{ base: "1", md: "2", lg: "3" }}
            gap={{ base: "5", lg: "6" }}
            alignItems="stretch"
          >
            {testimonials.map((item) => (
              <Box
                key={item.name}
                as="figure"
                bg="base"
                border="normal"
                borderColor="base"
                rounded="2xl"
                p={{ base: "6", lg: "7" }}
              >
                <Flex direction="column" alignItems="start" gap="5" h="full">
                  <StarRow />

                  {/* flex="1" lives on the Box, not the Text — Text exposes only
                      its typography recipe, so the growth wrapper is a Box. */}
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
