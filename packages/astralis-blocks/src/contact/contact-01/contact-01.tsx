import {
  Box,
  Button,
  Container,
  FieldLabel,
  FieldRoot,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  InputTextarea,
  Link,
  Stack,
  Text,
} from "astralis-ui";

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
const details = [
  {
    label: "Email",
    value: "hello@astralis.dev",
    href: "mailto:hello@astralis.dev",
    path: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm0 2 8 5 8-5",
  },
  {
    label: "Phone",
    value: "+1 (555) 000-1234",
    href: "tel:+15550001234",
    path: "M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z",
  },
  {
    label: "Office",
    value: "128 Palette St, San Francisco",
    href: null,
    path: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  },
];

function DetailIcon({ path }: { path: string }) {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      shrink="0"
      size="10"
      rounded="lg"
      bg="brand-subtle"
    >
      <Icon size="sm" color="brand" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={path} />
        </svg>
      </Icon>
    </Flex>
  );
}

/**
 * A two-column contact section: the pitch and the ways to reach a human on the
 * left, the form on the right in a bordered card. Collapses to one stacked
 * column below `lg`.
 *
 * The form submits nowhere as written — wire it to your own handler, or drop an
 * `onSubmit` and mark the file `"use client"`.
 */
export function Contact01() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Grid
          columns={{ base: "1", lg: "2" }}
          gap={{ base: "12", lg: "16" }}
          alignItems="start"
        >
          {/* ---- Pitch + details ---- */}
          <Stack direction="vertical" alignItems="start" gap="8">
            <Stack direction="vertical" alignItems="start" gap="4">
              <Text
                as="span"
                size="sm"
                weight="semibold"
                color="brand"
                casing="uppercase"
                letterSpacing="wider"
              >
                Contact
              </Text>
              <Heading as="h2" size={{ base: "3xl", lg: "4xl" }} weight="semibold">
                Let's talk about your design system
              </Heading>
              <Box maxW="md">
                <Text size={{ base: "md", lg: "lg" }} color="muted" lineHeight="relaxed">
                  Questions about adoption, theming or migration? Send a note and
                  we'll get back within a business day.
                </Text>
              </Box>
            </Stack>

            <Stack direction="vertical" alignItems="stretch" gap="5">
              {details.map((item) => (
                <Flex key={item.label} alignItems="center" gap="4">
                  <DetailIcon path={item.path} />
                  <Stack direction="vertical" gap="0.5">
                    <Text as="span" size="sm" color="muted">
                      {item.label}
                    </Text>
                    {item.href ? (
                      /* Link rather than `Text as="a"`: it carries Text's
                         typography anyway, and brings a hover state a bare
                         Text cannot express. */
                      <Link
                        href={item.href}
                        size="md"
                        weight="medium"
                        colorScheme="gray"
                        variant="hover"
                      >
                        {item.value}
                      </Link>
                    ) : (
                      <Text as="span" size="md" weight="medium">
                        {item.value}
                      </Text>
                    )}
                  </Stack>
                </Flex>
              ))}
            </Stack>
          </Stack>

          {/* ---- Form card ---- */}
          <Box
            bg="base"
            border="normal"
            borderColor="base"
            rounded="2xl"
            shadow="sm"
            p={{ base: "6", sm: "8" }}
          >
            <Stack as="form" direction="vertical" alignItems="stretch" gap="5">
              <Grid columns={{ base: "1", sm: "2" }} gap="5">
                <FieldRoot>
                  <FieldLabel>First name</FieldLabel>
                  <Input name="firstName" placeholder="Ada" autoComplete="given-name" required />
                </FieldRoot>
                <FieldRoot>
                  <FieldLabel>Last name</FieldLabel>
                  <Input name="lastName" placeholder="Lovelace" autoComplete="family-name" required />
                </FieldRoot>
              </Grid>

              <FieldRoot>
                <FieldLabel>Work email</FieldLabel>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </FieldRoot>

              <FieldRoot>
                <FieldLabel>How can we help?</FieldLabel>
                <InputTextarea
                  name="message"
                  placeholder="Tell us a little about your project…"
                  rows={5}
                  required
                />
              </FieldRoot>

              <Button type="submit" size="md" fullWidth>
                Send message
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
