import {
  Box,
  Container,
  Grid,
  Heading,
  Stack,
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
  StatHelpText,
  Text,
} from "astralis-ui";

const kpis = [
  { label: "Monthly active teams", value: "8,420", trend: "increase" as const, delta: "12.5%", note: "vs last month" },
  { label: "Median build time", value: "1.4s", trend: "decrease" as const, delta: "8.1%", note: "faster" },
  { label: "Bundle size", value: "0 kb", trend: "decrease" as const, delta: "100%", note: "no runtime CSS" },
  { label: "Uptime", value: "99.98%", trend: "increase" as const, delta: "0.2%", note: "last 90 days" },
];

/**
 * A dashboard-flavoured KPI band: four bordered cards, each pairing a `Stat`
 * with a trend indicator. This is exactly what `Stat` is scoped for — a compact
 * value with a label, a signed change, and a note.
 *
 * `Stat` IS the root — the compound wrapper stands in for it, which is why no
 * `StatRoot` is exported. A plain `Stat` tag is a real component, unlike the
 * dotted sub-component access that breaks across the RSC boundary, so the
 * children are the flat exports. Four across from md, two below.
 */
export function Stats02() {
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
              This quarter
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              align="center"
            >
              The numbers behind the release
            </Heading>
          </Stack>

          <Grid columns={{ base: "2", md: "4" }} gap={{ base: "4", lg: "6" }} alignItems="stretch">
            {kpis.map((kpi) => (
              <Box
                key={kpi.label}
                bg="base"
                border="normal"
                borderColor="base"
                rounded="2xl"
                p={{ base: "5", lg: "6" }}
              >
                <Stat>
                  <StatLabel>{kpi.label}</StatLabel>
                  <StatValue>{kpi.value}</StatValue>
                  <StatHelpText>
                    <StatIndicator type={kpi.trend}>{kpi.delta}</StatIndicator>{" "}
                    {kpi.note}
                  </StatHelpText>
                </Stat>
              </Box>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
