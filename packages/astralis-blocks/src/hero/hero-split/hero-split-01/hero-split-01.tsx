import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
} from "astralis-ui";

const stats = [
  { value: "62", label: "Components" },
  { value: "11", label: "Themeable palettes" },
  { value: "0kb", label: "Runtime CSS" },
];

/**
 * Two-column hero — copy on the left, a framed product shot on the right.
 * Collapses to a single stacked column below `lg`.
 */
export function HeroSplit01() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      {/* Container defaults to px="4". That reads as cramped for a hero at any
          width below the 6xl cap, where there is no centring margin to sit in. */}
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Grid
          columns={{ base: "1", lg: "2" }}
          gap={{ base: "12", lg: "16" }}
          alignItems="center"
        >
          {/* ---------------------------------------------------------- */}
          {/* Copy                                                       */}
          {/* ---------------------------------------------------------- */}
          <Stack direction="vertical" alignItems="start" gap="6">
            <Flex
              as="a"
              href="#changelog"
              alignItems="center"
              gap="2"
              pl="1.5"
              pr="3"
              py="1.5"
              bg="subtle"
              border="normal"
              borderColor="base"
              rounded="full"
            >
              <Badge variant="solid" colorScheme="brand" size="xs">
                New
              </Badge>
              <Text as="span" size="sm" color="muted">
                Realtime collaboration is live
              </Text>
            </Flex>

            <Heading
              as="h1"
              size={{ base: "4xl", lg: "6xl" }}
              weight="semibold"
              lineHeight="tight"
              letterSpacing="tight"
            >
              Ship the product, not another button
            </Heading>

            {/* Measure lives on the layout primitive — Text exposes only its own
                typography recipe, not Box's style props. */}
            <Box maxW="xl">
              <Text size={{ base: "md", lg: "lg" }} color="muted" lineHeight="relaxed">
                Accessible primitives, semantic design tokens, and one theme seed that
                repaints every surface you build. No runtime styling, no design debt.
              </Text>
            </Box>

            <Flex gap="3" wrap="wrap">
              <Button size="lg">Start building</Button>
              <Button size="lg" variant="surface" colorScheme="gray">
                Read the docs
              </Button>
            </Flex>

            <Flex gap="8" wrap="wrap" pt="2">
              {stats.map((stat) => (
                <Stack key={stat.label} direction="vertical" gap="0.5">
                  <Text size="2xl" weight="semibold" lineHeight="none">
                    {stat.value}
                  </Text>
                  <Text size="sm" color="muted">
                    {stat.label}
                  </Text>
                </Stack>
              ))}
            </Flex>
          </Stack>

          {/* ---------------------------------------------------------- */}
          {/* Media                                                      */}
          {/* ---------------------------------------------------------- */}
          <Box
            bg="subtle"
            border="normal"
            borderColor="base"
            rounded="2xl"
            shadow="xl"
            overflow="hidden"
          >
            {/* Window chrome — the tinted bar reads as a frame without a divider. */}
            <Flex alignItems="center" gap="2" bg="subtle" px="4" py="3">
              <Box size="2.5" bg="muted" rounded="full" />
              <Box size="2.5" bg="muted" rounded="full" />
              <Box size="2.5" bg="muted" rounded="full" />
            </Flex>

            <AspectRatio ratio="landscape">
              {/* Placeholder UI. Swap for your own screenshot:
                  <img src="/product.png" alt="Product dashboard" /> */}
              <Stack direction="vertical" gap="3" bg="base" p="5">
                <Box w="32" h="3" bg="muted" rounded="full" />
                <Box w="48" h="3" bg="muted" rounded="full" />
                <Grid columns="3" gap="3" pt="2">
                  <Box h="16" bg="brand-subtle" rounded="lg" />
                  <Box h="16" bg="subtle" rounded="lg" />
                  <Box h="16" bg="subtle" rounded="lg" />
                </Grid>
                <Box h="12" bg="subtle" rounded="lg" />
              </Stack>
            </AspectRatio>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
