"use client";

import { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  BreadcrumbItem,
  BreadcrumbLink,
  Breadcrumb,
  Flex,
  Grid,
  Icon,
  Input,
  Kbd,
  Stack,
  Text,
} from "astralis-ui";

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. Swap these
   for your own set; every nav entry just names a path. */
const paths = {
  home: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z",
  chart: "M5 20V10m7 10V4m7 16v-6",
  users: "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm11 9v-1a4 4 0 0 0-3-3.9M16 4.1a4 4 0 0 1 0 7.8",
  folder: "M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z",
  invoice: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 15H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.3 8.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V4a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.1 1Z",
  help: "M12 17h.01M9.1 9a3 3 0 1 1 4.2 2.7c-.8.4-1.3 1-1.3 1.8v.5",
  bell: "M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7ZM10.3 20a2 2 0 0 0 3.4 0",
  menu: "M4 7h16M4 12h16M4 17h16",
};

const groups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: paths.home, active: true },
      { label: "Analytics", icon: paths.chart },
      { label: "Customers", icon: paths.users, badge: "24" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", icon: paths.folder },
      { label: "Invoices", icon: paths.invoice, badge: "3" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", icon: paths.settings },
      { label: "Support", icon: paths.help },
    ],
  },
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
 * A nav row. The resting rows lift to the base surface on hover and take a
 * brand ring on keyboard focus; the active row already paints one, so it only
 * deepens its label. Both come from the interaction-state props, so the row
 * needs no CSS of its own.
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
      bg={item.active ? "base" : undefined}
      color={item.active ? "base" : "muted"}
      shadow={item.active ? "xs" : undefined}
      hover={item.active ? undefined : { bg: "base", color: "base" }}
      focusVisible={{ borderColor: "brand" }}
    >
      {/* `justifyContent="between"` pushes the badge to the trailing edge —
          there is no `ml="auto"`, the margin scale carries no auto. */}
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
      {/* ---- Workspace ---- */}
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
        <Stack direction="vertical">
          <Text as="span" size="sm" weight="semibold" lineHeight="tight">
            Astralis
          </Text>
          <Text as="span" size="xs" color="muted" lineHeight="tight">
            Pro workspace
          </Text>
        </Stack>
      </Flex>

      {/* ---- Nav ---- */}
      <Box as="nav" aria-label="Sidebar" flex="1" overflowY="auto" px="3" py="2">
        <Stack direction="vertical" alignItems="stretch" gap="6">
          {groups.map((group) => (
            <Stack key={group.label} direction="vertical" alignItems="stretch" gap="1">
              <Box px="3" pb="1">
                <Text
                  as="span"
                  size="xs"
                  weight="medium"
                  color="subtle"
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

      {/* ---- User ---- */}
      <Box shrink="0" p="3" borderT="normal" borderColor="subtle">
        <Flex alignItems="center" gap="3" px="2" py="1.5">
          <Avatar name="Ada Lovelace" size="sm" />
          <Stack direction="vertical">
            <Text as="span" size="sm" weight="medium" lineHeight="tight">
              Ada Lovelace
            </Text>
            <Text as="span" size="xs" color="muted" lineHeight="tight">
              ada@astralis.dev
            </Text>
          </Stack>
        </Flex>
      </Box>
    </Flex>
  );
}

/**
 * A dashboard shell: fixed sidebar, sticky header, and an empty content region
 * for your own page to fill. This is scaffolding — the placeholder panels below
 * mark where content goes and are meant to be deleted.
 *
 * Below `lg` the sidebar leaves the flow and the header's menu button opens it
 * as an overlay drawer. That disclosure is the only state here, so everything
 * else stays plain markup.
 */
export function Dashboard01() {
  const [open, setOpen] = useState(false);

  return (
    <Flex alignItems="stretch" minH="screen" bg="base">
      {/* ---------------------------------------------------------------- */}
      {/* Sidebar — in-flow from lg                                        */}
      {/* ---------------------------------------------------------------- */}
      <Box
        as="aside"
        w="64"
        shrink="0"
        bg="subtle"
        borderR="normal"
        borderColor="base"
        display={{ base: "hidden", lg: "block" }}
      >
        <SidebarContent />
      </Box>

      {/* Mobile drawer. Rendered only while open, so the backdrop never sits
          over the page collecting clicks when the menu is closed. */}
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
          <Box
            position="relative"
            w="72"
            maxW="full"
            h="full"
            bg="subtle"
            borderR="normal"
            borderColor="base"
            shadow="xl"
          >
            <SidebarContent />
          </Box>
        </Box>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Main column                                                      */}
      {/* ---------------------------------------------------------------- */}
      <Flex direction="column" alignItems="stretch" flex="1">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="high"
          alignItems="center"
          gap="4"
          h="16"
          shrink="0"
          px={{ base: "4", lg: "6" }}
          bg="base"
          borderB="normal"
          borderColor="base"
        >
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

          {/* The flat exports, not `Breadcrumb.Item` — a client-reference stub
              carries no static properties, so dotted access resolves to
              undefined once this block is copied into a Server Component tree.
              The root draws the separators itself. */}
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink isCurrent>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* `ml="auto"` pushes this group to the far edge — no spacer element. */}
          <Flex alignItems="center" gap="3" shrink="0" ml="auto">
            <Box w="64" display={{ base: "hidden", md: "block" }}>
              <Input
                type="search"
                size="sm"
                placeholder="Search…"
                aria-label="Search"
              />
            </Box>
            <Box display={{ base: "hidden", lg: "block" }}>
              <Kbd size="sm">⌘K</Kbd>
            </Box>
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

        {/* ---- Content region — replace everything inside ----
            `h="full"` on the stack and `flex="1"` on the last panel: the tiles
            keep their fixed height and the panel absorbs whatever is left, so
            the region fills the viewport instead of stopping short of it. */}
        <Box as="main" flex="1" p={{ base: "4", lg: "6" }}>
          <Stack direction="vertical" alignItems="stretch" gap={{ base: "4", lg: "6" }} h="full">
            <Grid columns={{ base: "1", md: "3" }} gap={{ base: "4", lg: "6" }}>
              <Box h="32" bg="subtle" rounded="xl" />
              <Box h="32" bg="subtle" rounded="xl" />
              <Box h="32" bg="subtle" rounded="xl" />
            </Grid>
            <Box flex="1" minH="96" bg="subtle" rounded="xl" />
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
}
