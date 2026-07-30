import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Stack,
  Text,
} from "astralis-ui";

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. Each glyph
   is a plain function so the feature list below stays readable data. */
const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.75",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function BoltIcon() {
  return (
    <svg {...stroke}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...stroke}>
      <path d="M12 3 4 6v6c0 4.4 3.2 8.1 8 9 4.8-.9 8-4.6 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg {...stroke}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg {...stroke}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

const features = [
  {
    icon: <BoltIcon />,
    title: "Zero runtime cost",
    body: "Every style resolves at build time. No style recalculation on mount, no cascade of context providers, nothing shipped to parse.",
  },
  {
    icon: <PaletteIcon />,
    title: "One theme seed",
    body: "Set a brand hue and a neutral ramp. Every surface, border and label repaints from the same tokens — no per-component overrides.",
  },
  {
    icon: <ShieldIcon />,
    title: "Accessible by default",
    body: "Focus rings, roving tabindex and ARIA wiring live inside the primitives, so the accessible path is also the shortest one.",
  },
  {
    icon: <LayersIcon />,
    title: "Composable primitives",
    body: "Layout, typography and interaction split cleanly. Box owns spacing, Text owns type — nothing reaches across that line.",
  },
  {
    icon: <TerminalIcon />,
    title: "Copy-in blocks",
    body: "Sections arrive as source in your repo, not as an import you have to fight. Edit the markup, keep the tokens.",
  },
  {
    icon: <GlobeIcon />,
    title: "Server-first",
    body: "Primitives render on the server unmodified. Client boundaries stay where you put them instead of creeping up the tree.",
  },
];

/**
 * Six features as flat bordered cards, three across. Icon tiles sit above the
 * copy so the card reads top-down. Drops to two columns at `sm`, one at `base`.
 */
export function Features01() {
  return (
    <Box as="section" bg="base" py={{ base: "16", lg: "24" }}>
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Stack direction="vertical" alignItems="stretch" gap={{ base: "12", lg: "16" }}>
          {/* ---------------------------------------------------------- */}
          {/* Section heading                                            */}
          {/* ---------------------------------------------------------- */}
          <Stack direction="vertical" alignItems="center" gap="3">
            <Text
              as="span"
              size="xs"
              weight="semibold"
              color="brand"
              casing="uppercase"
              letterSpacing="wider"
            >
              Why Astralis
            </Text>
            <Heading
              as="h2"
              size={{ base: "3xl", lg: "4xl" }}
              weight="semibold"
              lineHeight="tight"
              letterSpacing="tight"
              align="center"
            >
              Everything the design system should have done
            </Heading>
            <Box maxW="2xl">
              <Text size="md" color="muted" align="center" lineHeight="relaxed">
                Primitives that stay out of the way, tokens that survive a rebrand, and
                sections you own outright the moment you paste them in.
              </Text>
            </Box>
          </Stack>

          {/* ---------------------------------------------------------- */}
          {/* Feature grid                                               */}
          {/* ---------------------------------------------------------- */}
          <Grid
            columns={{ base: "1", sm: "2", lg: "3" }}
            gap={{ base: "4", lg: "6" }}
            alignItems="stretch"
          >
            {features.map((feature) => (
              // base page, subtle card: an alternate surface one step off the
              // page, with stroke-base carrying the edge rather than a shadow.
              <Box
                key={feature.title}
                bg="subtle"
                border="normal"
                borderColor="base"
                rounded="2xl"
                p={{ base: "6", lg: "7" }}
                h="full"
              >
                <Stack direction="vertical" alignItems="start" gap="4">
                  {/* The tile carries the accent so the icon itself can stay a
                      one-colour glyph — recolouring the seed moves both. */}
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    size="11"
                    bg="brand-subtle"
                    rounded="xl"
                  >
                    <Icon size="md" color="brand-solid" aria-hidden="true">
                      {feature.icon}
                    </Icon>
                  </Flex>

                  <Heading as="h3" size="md" weight="semibold">
                    {feature.title}
                  </Heading>

                  <Text size="sm" color="muted" lineHeight="relaxed">
                    {feature.body}
                  </Text>
                </Stack>
              </Box>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
