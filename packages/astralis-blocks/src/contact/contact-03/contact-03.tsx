import {
  Box,
  Button,
  Container,
  FieldLabel,
  Field,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  InputTextarea,
  Stack,
  Text,
} from "astralis-ui";

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
const details = [
  {
    label: "Email us",
    value: "hello@astralis.dev",
    path: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm0 2 8 5 8-5",
  },
  {
    label: "Call us",
    value: "+1 (555) 000-1234",
    path: "M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z",
  },
  {
    label: "Visit us",
    value: "128 Palette St, San Francisco",
    path: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  },
];

/**
 * The contact split with the pitch pulled into an inverted panel — a dark card
 * carrying the heading and contact lines beside the form on the base surface.
 *
 * On the inverted panel the accent channel no longer applies, so the icon tiles
 * flip to the light base surface (a light chip on the dark card) and the labels
 * are dimmed with `opacity` on their wrapper rather than a muted colour, since
 * the label ladder has no inverted-muted rung. Stacks below `lg`.
 */
export function Contact03() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Grid
          columns={{ base: "1", lg: "2" }}
          gap={{ base: "10", lg: "12" }}
          alignItems="stretch"
        >
          {/* ---- Inverted pitch panel ---- */}
          <Box bg="inverted" rounded="3xl" p={{ base: "8", sm: "10", lg: "12" }}>
            <Stack direction="vertical" alignItems="start" gap="8" h="full">
              <Stack direction="vertical" alignItems="start" gap="4">
                <Heading
                  as="h2"
                  size={{ base: "3xl", lg: "4xl" }}
                  weight="semibold"
                  color="inverted"
                >
                  Get in touch
                </Heading>
                <Box maxW="sm" opacity="high">
                  <Text size={{ base: "md", lg: "lg" }} color="inverted" lineHeight="relaxed">
                    Tell us what you're building and we'll point you at the right
                    person — usually within a business day.
                  </Text>
                </Box>
              </Stack>

              <Stack direction="vertical" alignItems="stretch" gap="5">
                {details.map((item) => (
                  <Flex key={item.label} alignItems="center" gap="4">
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      shrink="0"
                      size="10"
                      rounded="lg"
                      bg="base"
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
                          <path d={item.path} />
                        </svg>
                      </Icon>
                    </Flex>
                    <Stack direction="vertical" gap="0.5">
                      <Box opacity="high">
                        <Text as="span" size="sm" color="inverted">
                          {item.label}
                        </Text>
                      </Box>
                      <Text as="span" size="md" weight="medium" color="inverted">
                        {item.value}
                      </Text>
                    </Stack>
                  </Flex>
                ))}
              </Stack>
            </Stack>
          </Box>

          {/* ---- Form ---- */}
          <Stack as="form" direction="vertical" alignItems="stretch" gap="5">
            <Grid columns={{ base: "1", sm: "2" }} gap="5">
              <Field>
                <FieldLabel>First name</FieldLabel>
                <Input name="firstName" placeholder="Ada" autoComplete="given-name" required />
              </Field>
              <Field>
                <FieldLabel>Last name</FieldLabel>
                <Input name="lastName" placeholder="Lovelace" autoComplete="family-name" required />
              </Field>
            </Grid>

            <Field>
              <FieldLabel>Work email</FieldLabel>
              <Input
                type="email"
                name="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Company</FieldLabel>
              <Input name="company" placeholder="Acme Inc." autoComplete="organization" />
            </Field>

            <Field>
              <FieldLabel>Message</FieldLabel>
              <InputTextarea
                name="message"
                placeholder="Tell us a little about your project…"
                rows={5}
                required
              />
            </Field>

            <Button type="submit" size="md" fullWidth>
              Send message
            </Button>
          </Stack>
        </Grid>
      </Container>
    </Box>
  );
}
