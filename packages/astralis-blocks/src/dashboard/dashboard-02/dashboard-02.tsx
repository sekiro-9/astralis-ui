import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Input,
  Stack,
  Text,
} from "astralis-ui";

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
const paths = {
  home: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z",
  chart: "M5 20V10m7 10V4m7 16v-6",
  users: "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm11 9v-1a4 4 0 0 0-3-3.9M16 4.1a4 4 0 0 1 0 7.8",
  folder: "M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 15H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.3 8.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V4a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.1 1Z",
  plus: "M12 5v14M5 12h14",
};

const rail = [
  { label: "Dashboard", icon: paths.home, active: true },
  { label: "Analytics", icon: paths.chart },
  { label: "Customers", icon: paths.users },
  { label: "Projects", icon: paths.folder },
  { label: "Settings", icon: paths.settings },
];

function RailIcon({ path }: { path: string }) {
  return (
    <Icon size="sm" color="inherit" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </Icon>
  );
}

/**
 * A dashboard shell built on an icon rail: the nav collapses to labelled icons,
 * so it survives every viewport without a drawer — which is what keeps this
 * variation free of client state.
 *
 * The rail's labels ride on `title` and `aria-label` rather than a Tooltip:
 * Tooltip is a hover-driven client component, and a shell should not drag one
 * into a Server Component tree just to name an icon.
 *
 * The content sits in an inset panel — an empty region for your page to fill.
 */
export function Dashboard02() {
  return (
    <Flex alignItems="stretch" minH="screen" bg="subtle">
      {/* ---------------------------------------------------------------- */}
      {/* Icon rail                                                        */}
      {/* ---------------------------------------------------------------- */}
      <Flex
        as="aside"
        direction="column"
        alignItems="center"
        gap="4"
        w="16"
        shrink="0"
        py="4"
        bg="base"
        borderR="normal"
        borderColor="base"
      >
        <Flex
          alignItems="center"
          justifyContent="center"
          shrink="0"
          size="9"
          rounded="lg"
          bg="brand"
        >
          <Text as="span" size="sm" weight="semibold" color="brand-contrast">
            A
          </Text>
        </Flex>

        <Flex as="nav" aria-label="Sidebar" direction="column" alignItems="center" gap="1" flex="1">
          {rail.map((item) => (
            <Flex
              key={item.label}
              as="a"
              href="#"
              title={item.label}
              aria-label={item.label}
              aria-current={item.active ? "page" : undefined}
              alignItems="center"
              justifyContent="center"
              size="10"
              rounded="lg"
              bg={item.active ? "brand-subtle" : undefined}
              color={item.active ? "brand" : "muted"}
              hover={item.active ? undefined : { bg: "subtle", color: "base" }}
              focusVisible={{ borderColor: "brand" }}
            >
              <RailIcon path={item.icon} />
            </Flex>
          ))}
        </Flex>

        <Avatar name="Ada Lovelace" size="sm" />
      </Flex>

      {/* ---------------------------------------------------------------- */}
      {/* Main column                                                      */}
      {/* ---------------------------------------------------------------- */}
      <Flex direction="column" alignItems="stretch" flex="1">
        <Flex
          as="header"
          alignItems="center"
          gap="4"
          h="16"
          shrink="0"
          px={{ base: "4", lg: "6" }}
          bg="base"
          borderB="normal"
          borderColor="base"
        >
          <Stack direction="vertical">
            <Text as="h1" size="md" weight="semibold" lineHeight="tight">
              Overview
            </Text>
            <Box display={{ base: "hidden", sm: "block" }}>
              <Text as="span" size="xs" color="muted" lineHeight="tight">
                Last updated 4 minutes ago
              </Text>
            </Box>
          </Stack>

          <Box flex="1" />

          <Flex alignItems="center" gap="3" shrink="0">
            <Box w="56" display={{ base: "hidden", md: "block" }}>
              <Input type="search" size="sm" placeholder="Search…" aria-label="Search" />
            </Box>
            <Button size="sm" leftIcon={<RailIcon path={paths.plus} />}>
              New project
            </Button>
          </Flex>
        </Flex>

        {/* ---- Content region — replace everything inside ---- */}
        <Box as="main" flex="1" p={{ base: "4", lg: "6" }}>
          <Box
            h="full"
            minH="96"
            bg="base"
            border="normal"
            borderColor="base"
            rounded="2xl"
          />
        </Box>
      </Flex>
    </Flex>
  );
}
