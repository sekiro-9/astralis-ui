import {
  Box,
  Button,
  Checkbox,
  Container,
  FieldLabel,
  FieldRoot,
  Flex,
  FlexItem,
  Heading,
  Icon,
  Input,
  InputPassword,
  Link,
  Separator,
  Stack,
  Text,
} from "astralis-ui";

/**
 * Blocks bundle no icon library, so marks are raw SVG through Icon's BYO path.
 * Monochrome on purpose — swap in the brand-coloured versions if you prefer.
 */
function GoogleMark() {
  return (
    <Icon size="sm" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 11v2.9h4.1a3.6 3.6 0 0 1-1.5 2.3l2.4 1.9a7.3 7.3 0 0 0 2.2-5.5c0-.6-.05-1.1-.15-1.6H12Z" />
        <path d="M6.9 13.7 6.3 14l-1.9 1.5A7.5 7.5 0 0 0 11.1 20a7.2 7.2 0 0 0 5-1.8l-2.4-1.9a4.5 4.5 0 0 1-6.8-2.6Z" />
        <path d="M4.4 8.5A7.4 7.4 0 0 0 3.6 12c0 1.2.3 2.4.8 3.5L7.1 13a4.5 4.5 0 0 1 0-2.8L4.4 8.5Z" />
        <path d="M11.1 7.5c1.1 0 2.1.4 2.9 1.1l2.1-2.1A7.3 7.3 0 0 0 11.1 4a7.5 7.5 0 0 0-6.7 4.5L7.1 11a4.5 4.5 0 0 1 4-3.5Z" />
      </svg>
    </Icon>
  );
}

function GithubMark() {
  return (
    <Icon size="sm" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
      </svg>
    </Icon>
  );
}

function LockMark() {
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
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </Icon>
  );
}

/** Centred sign-in card with social providers. */
export function Login01() {
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
              <LockMark />
            </Flex>
            <Stack direction="vertical" alignItems="center" gap="1.5">
              <Heading as="h1" size="2xl" weight="semibold" letterSpacing="tight">
                Welcome back
              </Heading>
              <Text size="sm" color="muted" align="center">
                Sign in to pick up exactly where you left off.
              </Text>
            </Stack>
          </Stack>

          {/* ---- Form panel ----
              A Box rather than Card: this is a form container, and Card's
              padding is fixed by its size scale (lg tops out at 28/20px),
              which reads tight around a stack of inputs. */}
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
              <FieldRoot>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </FieldRoot>

              <FieldRoot>
                <Flex alignItems="center" justifyContent="between" gap="3">
                  <FieldLabel>Password</FieldLabel>
                  <Link href="#forgot-password">
                    <Text as="span" size="sm" color="inherit">
                      Forgot password?
                    </Text>
                  </Link>
                </Flex>
                <InputPassword
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </FieldRoot>

              <Checkbox name="remember" size="sm">
                Keep me signed in for 30 days
              </Checkbox>

              <Button type="submit" size="md" fullWidth>
                Sign in
              </Button>

              <Flex alignItems="center" gap="3">
                <Separator flex="1" />
                <Text as="span" size="xs" color="subtle" casing="uppercase" letterSpacing="wider">
                  or continue with
                </Text>
                <Separator flex="1" />
              </Flex>

              {/* Button carries no style props, so the split is done by a
                  wrapper rather than on the buttons themselves. */}
              <Flex gap="3">
                <FlexItem flex="1">
                  <Button
                    type="button"
                    variant="surface"
                    colorScheme="gray"
                    size="md"
                    fullWidth
                    leftIcon={<GoogleMark />}
                  >
                    Google
                  </Button>
                </FlexItem>
                <FlexItem flex="1">
                  <Button
                    type="button"
                    variant="surface"
                    colorScheme="gray"
                    size="md"
                    fullWidth
                    leftIcon={<GithubMark />}
                  >
                    GitHub
                  </Button>
                </FlexItem>
              </Flex>
            </Stack>
          </Box>

          <Text size="sm" color="muted" align="center">
            Don&apos;t have an account?{" "}
            <Link href="#signup">
              <Text as="span" size="sm" weight="medium" color="inherit">
                Create one
              </Text>
            </Link>
          </Text>
        </Stack>
      </Container>
    </Flex>
  );
}
