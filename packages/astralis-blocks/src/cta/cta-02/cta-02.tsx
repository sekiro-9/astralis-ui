import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Link,
  Stack,
  Text,
} from "astralis-ui";

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
function ArrowRight() {
  return (
    <Icon size="xs" color="inherit" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h13M13 6l6 6-6 6" />
      </svg>
    </Icon>
  );
}

/**
 * Inverted full-bleed band: copy on the left, actions on the right. The band
 * runs edge to edge and closes the page, so it takes no rounding — the panel
 * *is* the section.
 *
 * On an inverted fill the accent channel no longer applies, so the secondary
 * action is a Link with `color="inverted"` rather than a ghost Button. The
 * explicit colour holds in both states and the underline carries the hover.
 */
export function Cta02() {
  return (
    <Box as="section" bg="inverted" py={{ base: "14", lg: "20" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          alignItems={{ base: "start", lg: "center" }}
          justifyContent="between"
          gap={{ base: "8", lg: "12" }}
        >
          <Stack direction="vertical" alignItems="start" gap="3">
            <Heading
              as="h2"
              size={{ base: "2xl", lg: "3xl" }}
              weight="semibold"
              color="inverted"
            >
              Your next component library is already themed
            </Heading>

            {/* `opacity` on the wrapper rather than a dimmer colour: the label
                ladder has no inverted-muted rung, and dimming the fill keeps
                the copy tied to the heading above it. */}
            <Box maxW="xl" opacity="high">
              <Text size="md" color="inverted" lineHeight="relaxed">
                Swap the seed, keep the components. Every surface, border and
                label re-derives from the same three ladders.
              </Text>
            </Box>
          </Stack>

          {/* shrink="0" so the actions never compress once the heading wraps. */}
          <Flex alignItems="center" gap="6" shrink="0" wrap="wrap">
            <Button size="lg">Get started free</Button>

            <Link href="#contact" color="inverted" variant="hover">
              <Flex as="span" alignItems="center" gap="1.5">
                <Text as="span" size="sm" weight="medium" color="inherit">
                  Talk to sales
                </Text>
                <ArrowRight />
              </Flex>
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
