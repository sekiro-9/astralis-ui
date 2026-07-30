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
  {
    name: "Mara Feld",
    role: "Co-founder & CEO",
    bio: "Previously led platform at Northwind. Believes the best design system is the one nobody has to think about.",
  },
  {
    name: "Diego Salas",
    role: "Co-founder & CTO",
    bio: "Compiler nerd turned frontend. Wrote the first version of the token engine on a train.",
  },
  {
    name: "Priya Nair",
    role: "Head of Design",
    bio: "Ran design systems at Loom Labs. Cares more about contrast ratios than anyone should.",
  },
  {
    name: "Tom Becker",
    role: "Head of Engineering",
    bio: "Ships fast, deletes faster. Keeps the bundle honest and the CI green.",
  },
  {
    name: "Aïcha Benali",
    role: "Product Lead",
    bio: "Turns a wall of feature requests into a roadmap that fits on one page.",
  },
  {
    name: "Sam Whitfield",
    role: "Design Systems",
    bio: "Lives in the space between Figma and the codebase, making sure the two agree.",
  },
];

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
const socials = [
  {
    label: "GitHub",
    path: "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
  },
  {
    label: "X",
    path: "M18.9 2H22l-7.1 8.1L23.2 22h-6.5l-5.1-6.6L5.8 22H2.7l7.6-8.7L1.8 2h6.6l4.6 6.1L18.9 2Z",
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
 * The same team skeleton with more to say: bordered cards on a tinted band,
 * each pairing an avatar with a short bio and a social row pinned to the
 * bottom. The card is a flex column so those rows line up across the grid
 * regardless of bio length. Three across from md, one below.
 */
export function Team02() {
  return (
    <Box as="section" bg="subtle" py={{ base: "16", lg: "24" }}>
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
              Leadership
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              align="center"
            >
              Who you'll be working with
            </Heading>
          </Stack>

          <Grid
            columns={{ base: "1", md: "3" }}
            gap={{ base: "5", lg: "6" }}
            alignItems="stretch"
          >
            {members.map((member) => (
              <Box
                key={member.name}
                bg="base"
                border="normal"
                borderColor="base"
                rounded="2xl"
                p={{ base: "6", lg: "7" }}
              >
                <Flex direction="column" alignItems="start" gap="4" h="full">
                  <Flex alignItems="center" gap="4">
                    <Avatar name={member.name} size="lg" />
                    <Stack direction="vertical" gap="0.5">
                      <Text as="span" size="md" weight="medium">
                        {member.name}
                      </Text>
                      <Text as="span" size="sm" color="muted">
                        {member.role}
                      </Text>
                    </Stack>
                  </Flex>

                  {/* flex="1" lives on the Box — Text carries only its own
                      typography recipe, so the growth wrapper is a Box. */}
                  <Box flex="1">
                    <Text size="sm" color="muted" lineHeight="relaxed">
                      {member.bio}
                    </Text>
                  </Box>

                  <SocialRow name={member.name} />
                </Flex>
              </Box>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
