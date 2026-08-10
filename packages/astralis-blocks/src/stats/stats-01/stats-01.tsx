import {
  Box,
  Container,
  Grid,
  Heading,
  Stack,
  Stat,
  StatLabel,
  StatValue,
  Text,
} from "astralis-ui";

const metrics = [
  { value: "62", label: "Components" },
  { value: "11", label: "Themeable palettes" },
  { value: "99.8%", label: "Lighthouse a11y" },
  { value: "0kb", label: "Runtime CSS" },
];

/**
 * A marketing stats band — oversized numbers under a centred heading, four
 * across on desktop and two on mobile.
 *
 * The numbers are a real `Stat` — `size` reaches hero scale and drops back on
 * mobile, and `align="center"` centres the pair. Before those existed this
 * band had to hand-roll the same thing out of two `Text` elements.
 */
export function Stats01() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
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
              By the numbers
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              align="center"
            >
              Built to disappear into your product
            </Heading>
          </Stack>

          <Grid columns={{ base: "2", lg: "4" }} gap={{ base: "10", lg: "8" }}>
            {metrics.map((metric) => (
              /* Value first, label under it — the compound takes its order
                 from the children, so a marketing band and a dashboard KPI
                 can read in opposite directions. */
              <Stat key={metric.label} size={{ base: "lg", lg: "xl" }} align="center">
                <StatValue>{metric.value}</StatValue>
                <StatLabel>{metric.label}</StatLabel>
              </Stat>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
