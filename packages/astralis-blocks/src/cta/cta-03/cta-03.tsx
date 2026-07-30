import {
  Box,
  Button,
  Container,
  Flex,
  FlexItem,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "astralis-ui";

/**
 * Brand-tinted panel with an inline email capture. The tint comes from the
 * accent channel's subtle rung with its matching stroke, so the panel repaints
 * with the theme seed instead of hard-coding a hue.
 *
 * The form submits nowhere as written — point it at your own endpoint, or drop
 * an `onSubmit` on the form and mark the file `"use client"`.
 */
export function Cta03() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="5xl" px={{ base: "6", lg: "8" }}>
        <Box
          bg="brand-subtle"
          border="normal"
          borderColor="brand"
          rounded="3xl"
          p={{ base: "8", sm: "12", lg: "14" }}
        >
          <Stack direction="vertical" alignItems="center" gap="8">
            <Stack direction="vertical" alignItems="center" gap="4">
              <Text
                as="span"
                size="sm"
                weight="semibold"
                color="brand"
                casing="uppercase"
                letterSpacing="wider"
              >
                Changelog
              </Text>

              <Heading
                as="h2"
                size={{ base: "3xl", lg: "4xl" }}
                weight="semibold"
                align="center"
              >
                Every release, in your inbox
              </Heading>

              <Box maxW="lg">
                <Text size="md" color="muted" align="center" lineHeight="relaxed">
                  New components, token changes and migration notes — one short
                  email a month, nothing else.
                </Text>
              </Box>
            </Stack>

            {/* The form gets its own measure so the field never stretches to the
                full panel width on a wide viewport. */}
            <Box w="full" maxW="md">
              <Stack direction="vertical" alignItems="stretch" gap="3">
                <Flex
                  as="form"
                  direction={{ base: "column", sm: "row" }}
                  alignItems="stretch"
                  gap="3"
                >
                  {/* No visible label, so the field carries its own name.
                      FieldLabel is the better answer whenever there is room. */}
                  <FlexItem flex="1">
                    <Input
                      type="email"
                      name="email"
                      size="lg"
                      placeholder="you@company.com"
                      autoComplete="email"
                      aria-label="Email address"
                      required
                    />
                  </FlexItem>
                  <Button type="submit" size="lg">
                    Subscribe
                  </Button>
                </Flex>

                <Text size="xs" color="subtle" align="center">
                  Unsubscribe in one click. Read our{" "}
                  <Link href="#privacy" size="xs">
                    privacy policy
                  </Link>
                  .
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
