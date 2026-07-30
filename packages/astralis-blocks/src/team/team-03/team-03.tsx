import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
} from "astralis-ui";

const members = [
  { name: "Mara Feld", role: "CEO" },
  { name: "Diego Salas", role: "CTO" },
  { name: "Priya Nair", role: "Design" },
  { name: "Tom Becker", role: "Engineering" },
  { name: "Aïcha Benali", role: "Product" },
  { name: "Sam Whitfield", role: "Design Systems" },
  { name: "Yuki Tanaka", role: "Frontend" },
  { name: "Omar Haddad", role: "DevRel" },
  { name: "Ingrid Voss", role: "Accessibility" },
];

/**
 * The team skeleton split two ways: a heading column that stays put on the left
 * and the member grid on the right, so the section reads as a statement with
 * the faces as evidence. Rounded avatars for a squarer, denser look.
 *
 * One stacked column below lg, where the heading sits above the grid.
 */
export function Team03() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Grid
          columns={{ base: "1", lg: "3" }}
          gap={{ base: "10", lg: "16" }}
          alignItems="start"
        >
          {/* ---- Heading column ---- */}
          <GridItem colSpan="1">
            <Stack direction="vertical" alignItems="start" gap="5">
              <Text
                as="span"
                size="sm"
                weight="semibold"
                color="brand"
                casing="uppercase"
                letterSpacing="wider"
              >
                Careers
              </Text>
              <Heading as="h2" size={{ base: "3xl", lg: "4xl" }} weight="semibold">
                A team worth joining
              </Heading>
              <Text size={{ base: "md", lg: "lg" }} color="muted" lineHeight="relaxed">
                Nineteen people across six time zones, all shipping the same
                design system. We're hiring across engineering and design.
              </Text>
              <Button size="md">View open roles</Button>
            </Stack>
          </GridItem>

          {/* ---- Member grid ---- */}
          <GridItem colSpan={{ base: "1", lg: "2" }}>
            <Grid columns={{ base: "2", sm: "3" }} gap={{ base: "6", lg: "8" }}>
              {members.map((member) => (
                <Stack key={member.name} direction="vertical" alignItems="start" gap="3">
                  <Avatar name={member.name} size="xl" shape="rounded" />
                  <Stack direction="vertical" gap="0.5">
                    <Text as="span" size="sm" weight="medium">
                      {member.name}
                    </Text>
                    <Text as="span" size="sm" color="muted">
                      {member.role}
                    </Text>
                  </Stack>
                </Stack>
              ))}
            </Grid>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
