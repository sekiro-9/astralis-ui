import {
  Box,
  Button,
  Container,
  FieldLabel,
  Field,
  Flex,
  Grid,
  GridItem,
  Heading,
  Select,
  Stack,
  Text,
  Input,
  InputTextarea,
} from "astralis-ui";

const topics = [
  { value: "sales", label: "Talk to sales" },
  { value: "support", label: "Product support" },
  { value: "partnership", label: "Partnerships" },
  { value: "other", label: "Something else" },
];

const facts = [
  { label: "Response time", value: "Under one business day" },
  { label: "Support hours", value: "Mon–Fri, 9–6 PT" },
  { label: "Prefer async?", value: "hello@astralis.dev" },
];

/**
 * The same split, treated as a card on a tinted band: the form is a raised
 * (shadowed) panel on the left, the reassurance — response time, hours, an
 * email — sits on the right. Stacks below `lg`.
 *
 * `Select` carries a `name`, so it participates in native form submission with
 * no client state; the form still submits nowhere as written.
 */
export function Contact02() {
  return (
    <Box as="section" bg="subtle" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Grid
          columns={{ base: "1", lg: "5" }}
          gap={{ base: "10", lg: "16" }}
          alignItems="center"
        >
          {/* ---- Form card (wider column) ---- */}
          <GridItem colSpan={{ base: "1", lg: "3" }}>
            <Box bg="raised" rounded="2xl" shadow="md" p={{ base: "6", sm: "8" }}>
              <Stack as="form" direction="vertical" alignItems="stretch" gap="5">
                <Stack direction="vertical" gap="1">
                  <Heading as="h2" size="2xl" weight="semibold">
                    Send us a message
                  </Heading>
                  <Text size="sm" color="muted">
                    We read every one — no forms into the void.
                  </Text>
                </Stack>

                <Field>
                  <FieldLabel>Full name</FieldLabel>
                  <Input name="name" placeholder="Ada Lovelace" autoComplete="name" required />
                </Field>

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
                  <FieldLabel>What's it about?</FieldLabel>
                  <Select name="topic" options={topics} placeholder="Choose a topic" />
                </Field>

                <Field>
                  <FieldLabel>Message</FieldLabel>
                  <InputTextarea
                    name="message"
                    placeholder="Tell us a little about your project…"
                    rows={4}
                    required
                  />
                </Field>

                <Button type="submit" size="md" fullWidth>
                  Send message
                </Button>
              </Stack>
            </Box>
          </GridItem>

          {/* ---- Reassurance ---- */}
          <GridItem colSpan={{ base: "1", lg: "2" }}>
            <Stack direction="vertical" alignItems="start" gap="6">
              <Stack direction="vertical" alignItems="start" gap="3">
                <Text
                  as="span"
                  size="sm"
                  weight="semibold"
                  color="brand"
                  casing="uppercase"
                  letterSpacing="wider"
                >
                  We're listening
                </Text>
                <Heading as="h2" size={{ base: "2xl", lg: "3xl" }} weight="semibold">
                  A real person, not a ticket queue
                </Heading>
              </Stack>

              <Stack direction="vertical" alignItems="stretch" gap="4" w="full">
                {facts.map((fact) => (
                  <Flex
                    key={fact.label}
                    alignItems="baseline"
                    justifyContent="between"
                    gap="4"
                    pb="4"
                    borderB="normal"
                    borderColor="subtle"
                  >
                    <Text as="span" size="sm" color="muted">
                      {fact.label}
                    </Text>
                    <Text as="span" size="sm" weight="medium" align="right">
                      {fact.value}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </Stack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
