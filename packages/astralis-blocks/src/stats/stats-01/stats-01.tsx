import {
  Box,
  Container,
  Grid,
  Heading,
  Stack,
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
 * The numbers are `Text`, not `Stat`: Stat's value is fixed at `text-3xl` for a
 * dashboard KPI, which reads small at hero scale. See
 * reports/astralis-api-updates.md.
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
              <Stack key={metric.label} direction="vertical" alignItems="center" gap="2">
                <Text
                  as="span"
                  size={{ base: "4xl", lg: "5xl" }}
                  weight="semibold"
                  color="base"
                  lineHeight="none"
                  letterSpacing="tight"
                >
                  {metric.value}
                </Text>
                <Text as="span" size="sm" color="muted" align="center">
                  {metric.label}
                </Text>
              </Stack>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
