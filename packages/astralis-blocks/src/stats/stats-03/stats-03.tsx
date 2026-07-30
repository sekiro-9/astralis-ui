import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
} from "astralis-ui";

const metrics = [
  { value: "3.2M", label: "Components rendered daily" },
  { value: "40%", label: "Less CSS shipped, on average" },
  { value: "11", label: "Palettes from one seed" },
  { value: "<1 day", label: "Median migration time" },
];

/**
 * The stats skeleton as an inverted closing band, split two ways: the framing
 * on the left, a 2×2 grid of oversized numbers on the right. The heading and
 * numbers invert with the surface; the captions dim via `opacity` on their
 * wrapper, since the label ladder has no inverted-muted rung. Stacks below `lg`.
 */
export function Stats03() {
  return (
    <Box as="section" bg="inverted" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Grid
          columns={{ base: "1", lg: "2" }}
          gap={{ base: "12", lg: "16" }}
          alignItems="center"
        >
          {/* ---- Framing ---- */}
          <GridItem colSpan="1">
            <Stack direction="vertical" alignItems="start" gap="4">
              <Text
                as="span"
                size="sm"
                weight="semibold"
                color="inverted"
                casing="uppercase"
                letterSpacing="wider"
              >
                Proof, not promises
              </Text>
              <Heading
                as="h2"
                size={{ base: "3xl", lg: "4xl" }}
                weight="semibold"
                color="inverted"
              >
                Teams ship more and style less
              </Heading>
              <Box maxW="md" opacity="high">
                <Text size={{ base: "md", lg: "lg" }} color="inverted" lineHeight="relaxed">
                  Every number here comes out of production apps built on the same
                  primitives you'd install today.
                </Text>
              </Box>
            </Stack>
          </GridItem>

          {/* ---- Numbers ---- */}
          <GridItem colSpan="1">
            <Grid columns="2" gap={{ base: "8", lg: "10" }}>
              {metrics.map((metric) => (
                <Stack key={metric.label} direction="vertical" alignItems="start" gap="2">
                  <Text
                    as="span"
                    size={{ base: "4xl", lg: "5xl" }}
                    weight="semibold"
                    color="inverted"
                    lineHeight="none"
                    letterSpacing="tight"
                  >
                    {metric.value}
                  </Text>
                  <Box opacity="high">
                    <Text as="span" size="sm" color="inverted">
                      {metric.label}
                    </Text>
                  </Box>
                </Stack>
              ))}
            </Grid>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
