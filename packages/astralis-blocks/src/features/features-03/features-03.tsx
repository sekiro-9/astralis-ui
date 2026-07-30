import type { ReactNode } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Stack,
  Text,
} from "astralis-ui";

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.75",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function ClockIcon() {
  return (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function BranchIcon() {
  return (
    <svg {...stroke}>
      <circle cx="7" cy="6" r="2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="12" r="2" />
      <path d="M7 8v8M9 6h4a4 4 0 0 1 4 4" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg {...stroke}>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8M17 6l2 2M14 9l2 2" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg {...stroke}>
      <path d="M18 15V10a6 6 0 0 0-12 0v5l-2 3h16l-2-3Z" />
      <path d="M10 21h4" />
    </svg>
  );
}

/**
 * Small cell used by every tile but the lead one — icon, title, one line of
 * copy. Kept local so the supporting cells cannot drift apart.
 */
function FeatureCell({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Box
      bg="subtle"
      border="normal"
      borderColor="base"
      rounded="2xl"
      p={{ base: "6", lg: "7" }}
      h="full"
    >
      <Stack direction="vertical" alignItems="start" gap="4">
        <Icon size="md" color="brand-solid" aria-hidden="true">
          {icon}
        </Icon>
        <Heading as="h3" size="md" weight="semibold">
          {title}
        </Heading>
        <Text size="sm" color="muted" lineHeight="relaxed">
          {body}
        </Text>
      </Stack>
    </Box>
  );
}

/**
 * Bento layout — one wide lead tile carrying a placeholder visual, a tall tile
 * beside it and two supporting cells. Every span collapses below `lg` so the
 * whole thing becomes a single readable column on small screens.
 */
export function Features03() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "10", lg: "14" }}>
          {/* ---------------------------------------------------------- */}
          {/* Section heading                                            */}
          {/* ---------------------------------------------------------- */}
          <Stack direction="vertical" alignItems="start" gap="3">
            <Text
              as="span"
              size="xs"
              weight="semibold"
              color="brand"
              casing="uppercase"
              letterSpacing="wider"
            >
              Workflow
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              lineHeight="tight"
              letterSpacing="tight"
            >
              The parts you would have built anyway
            </Heading>
            <Box maxW="xl">
              <Text size="md" color="muted" lineHeight="relaxed">
                Deploy history, environment keys and alerting — already wired together,
                already talking to each other.
              </Text>
            </Box>
          </Stack>

          {/* ---------------------------------------------------------- */}
          {/* Bento                                                      */}
          {/* ---------------------------------------------------------- */}
          {/* Spans are declared per-breakpoint rather than left to collapse
              on their own: a colSpan="2" inside a one-column grid would still
              claim two tracks and blow the row out. */}
          <Grid columns={{ base: "1", lg: "3" }} gap={{ base: "4", lg: "6" }}>
            {/* Lead tile — wide, tinted, carries the visual ------------ */}
            <GridItem colSpan={{ base: "1", lg: "2" }}>
              {/* Brand-tinted rather than neutral, but still bordered: in a
                  bento every tile has to hold the same silhouette, and one
                  unbordered cell beside three bordered ones reads as a
                  rendering bug. The accent stroke keeps the edge in the
                  tile's own colour family. */}
              <Box
                bg="brand-subtle"
                border="normal"
                borderColor="brand"
                rounded="2xl"
                p={{ base: "6", lg: "8" }}
                h="full"
                overflow="hidden"
              >
                <Stack direction="vertical" alignItems="start" gap="6">
                  <Stack direction="vertical" alignItems="start" gap="3">
                    <Icon size="lg" color="brand-solid" aria-hidden="true">
                      <ClockIcon />
                    </Icon>
                    <Heading as="h3" size="xl" weight="semibold" lineHeight="tight">
                      Every deploy, replayable
                    </Heading>
                    <Box maxW="md">
                      <Text size="sm" color="muted" lineHeight="relaxed">
                        Roll back to any build in the history and the environment goes
                        with it — config, secrets and migrations included. The bad
                        Friday afternoon becomes a two-click afternoon.
                      </Text>
                    </Box>
                  </Stack>

                  {/* Placeholder visual. Swap for your own screenshot:
                      <img src="/deploys.png" alt="Deploy history" /> */}
                  <Box
                    w="full"
                    bg="subtle"
                    border="normal"
                    borderColor="base"
                    rounded="xl"
                    p="4"
                  >
                    <Stack direction="vertical" gap="3">
                      {["Production", "Preview", "Preview"].map((label, index) => (
                        <Flex key={label + index} alignItems="center" gap="3">
                          <Box
                            size="2"
                            rounded="full"
                            bg={index === 0 ? "brand" : "muted"}
                          />
                          <Text size="xs" weight="medium">
                            {label}
                          </Text>
                          <Box h="2" w={index === 0 ? "32" : "20"} bg="subtle" rounded="full" />
                        </Flex>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </GridItem>

            {/* Tall tile — one column, two rows on lg ----------------- */}
            <GridItem rowSpan={{ base: "1", lg: "2" }}>
              <FeatureCell
                icon={<BranchIcon />}
                title="Preview per branch"
                body="Push a branch and get a URL with its own database seeded from the last snapshot. It disappears when the branch merges, so nothing accumulates."
              />
            </GridItem>

            {/* Supporting cells --------------------------------------- */}
            <FeatureCell
              icon={<KeyIcon />}
              title="Scoped secrets"
              body="Per-environment keys that never print to a log."
            />

            <FeatureCell
              icon={<BellIcon />}
              title="Alerts that mean it"
              body="Thresholds on real traffic, not on synthetic pings."
            />
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
