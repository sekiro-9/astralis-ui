import {
  Avatar,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Link,
  Stack,
  Text,
} from "astralis-ui";

const members = [
  { name: "Mara Feld", role: "Co-founder & CEO" },
  { name: "Diego Salas", role: "Co-founder & CTO" },
  { name: "Priya Nair", role: "Head of Design" },
  { name: "Tom Becker", role: "Head of Engineering" },
  { name: "Aïcha Benali", role: "Product Lead" },
  { name: "Sam Whitfield", role: "Design Systems" },
  { name: "Yuki Tanaka", role: "Frontend Lead" },
  { name: "Omar Haddad", role: "Developer Relations" },
];

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
const socials = [
  {
    label: "GitHub",
    path: "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
  },
  {
    label: "LinkedIn",
    path: "M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3.5 8.5h3.9V21H3.5V8.5Zm6.5 0h3.7v1.7h.05c.52-.9 1.8-1.9 3.7-1.9 3.9 0 4.6 2.4 4.6 5.6V21h-3.9v-5.4c0-1.3 0-3-1.9-3s-2.15 1.4-2.15 2.9V21H10V8.5Z",
  },
];

function SocialRow({ name }: { name: string }) {
  return (
    <Flex alignItems="center" gap="3">
      {socials.map((item) => (
        <Link
          key={item.label}
          href="#"
          colorScheme="gray"
          variant="plain"
          aria-label={`${name} on ${item.label}`}
        >
          <Icon size="sm" color="inherit" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d={item.path} />
            </svg>
          </Icon>
        </Link>
      ))}
    </Flex>
  );
}

/**
 * A borderless four-up grid of centred portraits — the simplest team layout,
 * for a page that just needs to put faces to names. Avatars fall back to
 * initials with a deterministic hue; pass `src` for real photos.
 *
 * Two across from sm, four from lg, one below.
 */
export function Team01() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "10", lg: "14" }}>
          <Stack direction="vertical" alignItems="center" gap="4">
            <Text
              as="span"
              size="sm"
              weight="semibold"
              color="brand"
              casing="uppercase"
              letterSpacing="wider"
            >
              Our team
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              align="center"
            >
              The people behind the product
            </Heading>
            <Box maxW="xl">
              <Text size={{ base: "md", lg: "lg" }} color="muted" align="center" lineHeight="relaxed">
                A small team of engineers and designers who would rather ship the
                product than the button.
              </Text>
            </Box>
          </Stack>

          <Grid
            columns={{ base: "1", sm: "2", lg: "4" }}
            gap={{ base: "8", lg: "10" }}
            alignItems="start"
          >
            {members.map((member) => (
              <Stack key={member.name} direction="vertical" alignItems="center" gap="4">
                <Avatar name={member.name} size="2xl" />
                <Stack direction="vertical" alignItems="center" gap="1">
                  <Text as="span" size="md" weight="medium">
                    {member.name}
                  </Text>
                  <Text as="span" size="sm" color="muted">
                    {member.role}
                  </Text>
                </Stack>
                <SocialRow name={member.name} />
              </Stack>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
