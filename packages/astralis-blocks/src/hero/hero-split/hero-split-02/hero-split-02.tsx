import {
  AspectRatio,
  Box,
  Button,
  Container,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
  Text,
} from "astralis-ui";

const logos = ["Northwind", "Acme", "Contoso", "Initech"];

/** Bar heights for the placeholder chart, as a percentage of the plot area. */
const bars = [42, 68, 55, 84, 72, 96];

/**
 * Two-column hero with the media on the left and an email capture on the right,
 * over a tinted band. Stacks to one column below `lg`, media last.
 */
export function HeroSplit02() {
  return (
    <Box as="section" bg="subtle" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Grid
          columns={{ base: "1", lg: "2" }}
          gap={{ base: "12", lg: "16" }}
          alignItems="center"
        >
          {/* ---------------------------------------------------------- */}
          {/* Media — ordered first on wide screens, last when stacked.   */}
          {/* ---------------------------------------------------------- */}
          <GridItem
            order={{ base: "2", lg: "1" }}
            bg="base"
            border="normal"
            borderColor="base"
            rounded="2xl"
            shadow="lg"
            overflow="hidden"
          >
            <AspectRatio ratio="landscape">
              {/* Placeholder chart. Swap for your own screenshot:
                  <img src="/dashboard.png" alt="Revenue dashboard" /> */}
              <Stack direction="vertical" gap="5" bg="base" p="6">
                <Stack direction="vertical" gap="2">
                  <Box w="24" h="2.5" bg="muted" rounded="full" />
                  <Box w="40" h="2.5" bg="muted" rounded="full" />
                </Stack>

                <Flex alignItems="end" justifyContent="between" gap="3" h="40">
                  {bars.map((height, index) => (
                    <Box
                      key={height}
                      w="full"
                      h="full"
                      rounded="md"
                      bg={index === bars.length - 1 ? "brand" : "muted"}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </Flex>
              </Stack>
            </AspectRatio>
          </GridItem>

          {/* ---------------------------------------------------------- */}
          {/* Copy                                                        */}
          {/* ---------------------------------------------------------- */}
          <GridItem order={{ base: "1", lg: "2" }}>
            <Stack direction="vertical" alignItems="start" gap="6">
            <Flex alignItems="center" gap="3">
              <Box w="8" h="0.5" bg="brand" rounded="full" />
              <Text
                as="span"
                size="xs"
                weight="semibold"
                color="brand"
                casing="uppercase"
                letterSpacing="wider"
              >
                Analytics, finally readable
              </Text>
            </Flex>

            <Heading
              as="h1"
              size={{ base: "4xl", lg: "5xl" }}
              weight="semibold"
              lineHeight="tight"
              letterSpacing="tight"
            >
              Every number your team argues about, in one place
            </Heading>

            <Box maxW="lg">
              <Text size={{ base: "md", lg: "lg" }} color="muted" lineHeight="relaxed">
                Connect a warehouse, pick the metrics that matter, and ship a dashboard
                your whole company can read without a training session.
              </Text>
            </Box>

            {/* Wire this up to your own handler — it posts nowhere as written. */}
            <Flex as="form" gap="2" wrap="wrap" w="full" maxW="md">
              {/* Input carries no style props, so the wrapper does the growing
                  — the field takes the slack, the button keeps its width. */}
              <FlexItem flex="1" minW="48">
                <Input
                  type="email"
                  name="email"
                  size="lg"
                  placeholder="you@company.com"
                  aria-label="Work email"
                  required
                />
              </FlexItem>
              <Button type="submit" size="lg">
                Get early access
              </Button>
            </Flex>

            <Text size="xs" color="subtle">
              Free for 30 days. No card, no sales call.
            </Text>

            <Stack direction="vertical" gap="3" pt="2">
              <Text size="xs" color="subtle" casing="uppercase" letterSpacing="wider">
                Already trusted by
              </Text>
              <Flex gap="6" wrap="wrap" alignItems="center">
                {logos.map((logo) => (
                  <Text key={logo} size="sm" weight="semibold" color="subtle">
                    {logo}
                  </Text>
                ))}
              </Flex>
            </Stack>
            </Stack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
