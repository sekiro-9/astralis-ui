"use client";

import { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Flex,
  Grid,
  Icon,
  Separator,
  Stack,
  Text,
} from "astralis-ui";

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
const paths = {
  home: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z",
  chart: "M5 20V10m7 10V4m7 16v-6",
  users: "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm11 9v-1a4 4 0 0 0-3-3.9M16 4.1a4 4 0 0 1 0 7.8",
  folder: "M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z",
  invoice: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 15H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.3 8.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V4a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.1 1Z",
  menu: "M4 7h16M4 12h16M4 17h16",
  bell: "M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7ZM10.3 20a2 2 0 0 0 3.4 0",
};

const groups = [
  {
    label: "Monitor",
    items: [
      { label: "Dashboard", icon: paths.home, active: true },
      { label: "Analytics", icon: paths.chart },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Customers", icon: paths.users, badge: "24" },
      { label: "Projects", icon: paths.folder },
      { label: "Invoices", icon: paths.invoice, badge: "3" },
      { label: "Settings", icon: paths.settings },
    ],
  },
];

const tabs = [
  { label: "Overview", active: true },
  { label: "Activity" },
  { label: "Reports" },
  { label: "Members" },
];

function NavIcon({ path }: { path: string }) {
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

interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
  badge?: string;
}

/**
 * A nav row on the inverted rail. `color="inverted"` holds the label readable
 * on the dark fill; the resting rows dim through `opacity` on the row itself,
 * since the label ladder carries no inverted-muted rung.
 */
function NavRow({ item }: { item: NavItem }) {
  return (
    <Flex
      as="a"
      href="#"
      aria-current={item.active ? "page" : undefined}
      alignItems="center"
      justifyContent="between"
      gap="3"
      px="3"
      py="2"
      rounded="md"
      color="inverted"
      bg={item.active ? "brand" : undefined}
      opacity={item.active ? undefined : "high"}
      hover={item.active ? undefined : { opacity: "max" }}
    >
      <Flex alignItems="center" gap="3">
        <NavIcon path={item.icon} />
        <Text as="span" size="sm" weight={item.active ? "medium" : "normal"} color="inherit">
          {item.label}
        </Text>
      </Flex>
      {item.badge ? (
        <Badge variant="subtle" colorScheme="gray" size="xs">
          {item.badge}
        </Badge>
      ) : null}
    </Flex>
  );
}

/** The sidebar body, shared by the fixed rail and the mobile drawer. */
function SidebarContent() {
  return (
    <Flex direction="column" alignItems="stretch" h="full">
      <Flex alignItems="center" gap="2.5" h="16" px="4" shrink="0">
        <Flex
          alignItems="center"
          justifyContent="center"
          shrink="0"
          size="8"
          rounded="lg"
          bg="brand"
        >
          <Text as="span" size="sm" weight="semibold" color="brand-contrast">
            A
          </Text>
        </Flex>
        <Text as="span" size="md" weight="semibold" color="inverted" letterSpacing="tight">
          Astralis
        </Text>
      </Flex>

      <Box as="nav" aria-label="Sidebar" flex="1" overflowY="auto" px="3" py="2">
        <Stack direction="vertical" alignItems="stretch" gap="6">
          {groups.map((group) => (
            <Stack key={group.label} direction="vertical" alignItems="stretch" gap="1">
              <Box px="3" pb="1" opacity="moderate">
                <Text
                  as="span"
                  size="xs"
                  weight="medium"
                  color="inverted"
                  casing="uppercase"
                  letterSpacing="wider"
                >
                  {group.label}
                </Text>
              </Box>
              {group.items.map((item) => (
                <NavRow key={item.label} item={item} />
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box shrink="0" p="3">
        {/* The rule has to invert too, or it disappears into the fill. */}
        <Separator borderColor="inverted" opacity="low" />
        <Flex alignItems="center" gap="3" px="2" pt="4">
          <Avatar name="Ada Lovelace" size="sm" />
          <Stack direction="vertical">
            <Text as="span" size="sm" weight="medium" color="inverted" lineHeight="tight">
              Ada Lovelace
            </Text>
            <Box opacity="high">
              <Text as="span" size="xs" color="inverted" lineHeight="tight">
                ada@astralis.dev
              </Text>
            </Box>
          </Stack>
        </Flex>
      </Box>
    </Flex>
  );
}

/**
 * The shell with an inverted sidebar and a two-tier header: a title row over a
 * row of section tabs. The content region below is empty scaffolding for your
 * own page.
 *
 * The active tab is marked with a bottom border on the tab itself, so the rule
 * belongs to the tab rather than being a separate node under it.
 */
export function Dashboard03() {
  const [open, setOpen] = useState(false);

  return (
    <Flex alignItems="stretch" minH="screen" bg="base">
      <Box
        as="aside"
        w="64"
        shrink="0"
        bg="inverted"
        display={{ base: "hidden", lg: "block" }}
      >
        <SidebarContent />
      </Box>

      {open ? (
        <Box position="fixed" inset="0" zIndex="highest" display={{ base: "block", lg: "hidden" }}>
          <Box
            as="button"
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            position="absolute"
            inset="0"
            w="full"
            h="full"
            bg="inverted"
            opacity="moderate"
            cursor="pointer"
          />
          <Box position="relative" w="72" maxW="full" h="full" bg="inverted" shadow="xl">
            <SidebarContent />
          </Box>
        </Box>
      ) : null}

      <Flex direction="column" alignItems="stretch" flex="1">
        <Box as="header" shrink="0" bg="base" borderB="normal" borderColor="base">
          {/* ---- Tier one: title + actions ---- */}
          <Flex alignItems="center" gap="4" h="16" px={{ base: "4", lg: "6" }}>
            <Box
              as="button"
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              display={{ base: "inline-flex", lg: "hidden" }}
              cursor="pointer"
              p="2"
              rounded="md"
              bg="transparent"
              hover={{ bg: "subtle" }}
              focusVisible={{ borderColor: "brand" }}
            >
              <NavIcon path={paths.menu} />
            </Box>

            <Text as="h1" size="lg" weight="semibold" letterSpacing="tight">
              Dashboard
            </Text>

            <Box flex="1" />

            <Flex alignItems="center" gap="3" shrink="0">
              <Flex
                as="button"
                type="button"
                aria-label="Notifications"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                p="2"
                rounded="md"
                bg="transparent"
                hover={{ bg: "subtle" }}
                focusVisible={{ borderColor: "brand" }}
                color="muted"
              >
                <NavIcon path={paths.bell} />
              </Flex>
              <Avatar name="Ada Lovelace" size="sm" />
            </Flex>
          </Flex>

          {/* ---- Tier two: section tabs ---- */}
          <Flex
            as="nav"
            aria-label="Sections"
            alignItems="center"
            gap="6"
            px={{ base: "4", lg: "6" }}
            overflowX="auto"
          >
            {tabs.map((tab) => (
              <Box
                key={tab.label}
                as="a"
                href="#"
                aria-current={tab.active ? "page" : undefined}
                py="3"
                borderB={tab.active ? "thick" : undefined}
                borderColor={tab.active ? "brand" : undefined}
                color={tab.active ? "base" : "muted"}
                hover={tab.active ? undefined : { color: "base" }}
              >
                <Text as="span" size="sm" weight={tab.active ? "medium" : "normal"} color="inherit">
                  {tab.label}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>

        {/* ---- Content region — replace everything inside ----
            `h="full"` on the stack and `flex="1"` on the lower grid: the stat
            tiles keep their fixed height and the panels below absorb whatever
            is left, so the region fills the viewport instead of stopping short
            of it. */}
        <Box as="main" flex="1" p={{ base: "4", lg: "6" }}>
          <Stack direction="vertical" alignItems="stretch" gap={{ base: "4", lg: "6" }} h="full">
            <Grid columns={{ base: "1", md: "2", xl: "4" }} gap={{ base: "4", lg: "6" }}>
              <Box h="28" bg="subtle" rounded="xl" />
              <Box h="28" bg="subtle" rounded="xl" />
              <Box h="28" bg="subtle" rounded="xl" />
              <Box h="28" bg="subtle" rounded="xl" />
            </Grid>
            <Grid columns={{ base: "1", lg: "3" }} gap={{ base: "4", lg: "6" }} flex="1">
              <Box minH="80" h="full" bg="subtle" rounded="xl" />
              <Box minH="80" h="full" bg="subtle" rounded="xl" />
              <Box minH="80" h="full" bg="subtle" rounded="xl" />
            </Grid>
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
}
