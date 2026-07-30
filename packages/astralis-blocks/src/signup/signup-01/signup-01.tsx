import {
  Box,
  Button,
  Checkbox,
  Container,
  FieldHelpText,
  FieldLabel,
  FieldRoot,
  Flex,
  FlexItem,
  Heading,
  Icon,
  Input,
  InputPassword,
  Link,
  List,
  ListItem,
  Separator,
  Stack,
  Text,
} from "astralis-ui";

const perks = [
  "Free while you build — no card required",
  "Unlimited projects on every plan",
  "Cancel or export your data any time",
];

/** Blocks bundle no icon library — raw SVG through Icon's BYO path. */
function CheckMark() {
  return (
    <Icon size="sm" color="brand-solid" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </Icon>
  );
}

function SparkMark() {
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
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
      </svg>
    </Icon>
  );
}

/** Centred sign-up card with a short value list under the form. */
export function Auth02() {
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
              <SparkMark />
            </Flex>
            <Stack direction="vertical" alignItems="center" gap="1.5">
              <Heading as="h1" size="2xl" weight="semibold" letterSpacing="tight">
                Create your account
              </Heading>
              <Text size="sm" color="muted" align="center">
                Start building in under a minute. No card, no sales call.
              </Text>
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
            <Stack as="form" direction="vertical" alignItems="stretch" gap="5">
              {/* FieldRoot carries no style props, so the two columns are
                  sized by wrappers rather than on the fields themselves. */}
              <Flex gap="4" wrap="wrap">
                <FlexItem flex="1" minW="40">
                  <FieldRoot>
                    <FieldLabel>First name</FieldLabel>
                    <Input name="firstName" placeholder="Ada" autoComplete="given-name" required />
                  </FieldRoot>
                </FlexItem>
                <FlexItem flex="1" minW="40">
                  <FieldRoot>
                    <FieldLabel>Last name</FieldLabel>
                    <Input name="lastName" placeholder="Lovelace" autoComplete="family-name" required />
                  </FieldRoot>
                </FlexItem>
              </Flex>

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
                <FieldLabel>Password</FieldLabel>
                <InputPassword
                  name="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <FieldHelpText>At least 8 characters, with a number or symbol.</FieldHelpText>
              </FieldRoot>

              <Checkbox name="terms" size="sm" required>
                I agree to the Terms of Service and Privacy Policy
              </Checkbox>

              <Button type="submit" size="md" fullWidth>
                Create account
              </Button>

              <Separator />

              <List styleType="none" spacing="2">
                {perks.map((perk) => (
                  <ListItem key={perk} icon={<CheckMark />}>
                    <Text size="sm" color="muted">
                      {perk}
                    </Text>
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Box>

          <Text size="sm" color="muted" align="center">
            Already have an account?{" "}
            <Link href="#login">
              <Text as="span" size="sm" weight="medium" color="inherit">
                Sign in
              </Text>
            </Link>
          </Text>
        </Stack>
      </Container>
    </Flex>
  );
}
