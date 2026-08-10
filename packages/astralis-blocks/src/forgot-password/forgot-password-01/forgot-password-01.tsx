import {
  Box,
  Button,
  Container,
  FieldHelpText,
  FieldLabel,
  Field,
  Flex,
  Heading,
  Icon,
  Input,
  Link,
  Stack,
  Text,
} from "astralis-ui";

/** Blocks bundle no icon library — raw SVG through Icon's BYO path. */
function EnvelopeMark() {
  return (
    <Icon size="md" color="brand-contrast" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="14" x="3" y="5" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    </Icon>
  );
}

function ArrowLeftMark() {
  return (
    <Icon size="xs" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Icon>
  );
}

/** Single-field password reset request, with a route back to sign-in. */
export function ForgotPassword01() {
  return (
    /* An auth screen is a whole page, not a strip: it owns the viewport and
       centres its panel on both axes. `py` still guards the panel from the
       edges once the content outgrows a short window. */
    <Flex
      as="section"
      bg="subtle"
      minH="screen"
      alignItems="center"
      justifyContent="center"
      py={{ base: "16", lg: "24" }}
    >
      <Container maxW="md" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap="6">
          {/* ---- Masthead ---- */}
          <Stack direction="vertical" alignItems="center" gap="3">
            <Flex alignItems="center" justifyContent="center" size="11" rounded="xl" bg="brand">
              <EnvelopeMark />
            </Flex>
            <Stack direction="vertical" alignItems="center" gap="1.5">
              <Heading as="h1" size="2xl" weight="semibold" letterSpacing="tight">
                Reset your password
              </Heading>
              <Box maxW="sm">
                <Text size="sm" color="muted" align="center" lineHeight="relaxed">
                  Enter the email on your account and we&apos;ll send a link to set a new
                  password. It expires in an hour.
                </Text>
              </Box>
            </Stack>
          </Stack>

          {/* ---- Form panel ---- */}
          <Box
            bg="base"
            border="normal"
            borderColor="base"
            rounded="2xl"
            shadow="sm"
            p={{ base: "6", sm: "8" }}
          >
            {/* Wire this to your own handler — it submits nowhere as written. */}
            <Stack as="form" direction="vertical" alignItems="stretch" gap="10">
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
                <FieldHelpText>
                  We&apos;ll only send a link if this address has an account.
                </FieldHelpText>
              </Field>

              <Button type="submit" size="md" fullWidth>
                Send reset link
              </Button>
            </Stack>
          </Box>

          <Flex justifyContent="center">
            <Link href="#login" variant="plain" colorScheme="gray">
              <Flex alignItems="center" gap="1.5">
                <ArrowLeftMark />
                <Text as="span" size="sm" color="inherit">
                  Back to sign in
                </Text>
              </Flex>
            </Link>
          </Flex>
        </Stack>
      </Container>
    </Flex>
  );
}
