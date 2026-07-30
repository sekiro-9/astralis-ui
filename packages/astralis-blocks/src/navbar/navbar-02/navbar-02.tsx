"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Icon,
  Link,
  Stack,
  Text,
} from "astralis-ui";

const links = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
];

/* Blocks bundle no icon library — raw SVG through Icon's BYO path. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <Icon size="md" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      >
        {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
      </svg>
    </Icon>
  );
}

function ArrowIcon() {
  return (
    <Icon size="xs" color="inherit" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Icon>
  );
}

/** Neutral nav link — see navbar-01 for why the scheme is gray. */
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} colorScheme="gray" variant="plain" size="sm" weight="medium">
      {label}
    </Link>
  );
}

/**
 * Announcement strip above a sticky bar. The strip sits on the brand fill and
 * takes `brand-contrast` for its text, which is the one role guaranteed to be
 * readable on that fill whatever hue the theme seeds.
 */
export function Navbar02() {
  const [open, setOpen] = useState(false);

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="high"
      bg="base"
      borderB="normal"
      borderColor="base"
    >
      {/* ---- Announcement ---- */}
      <Box bg="brand" py="2.5">
        <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
          <Flex alignItems="center" justifyContent="center" gap="3" wrap="wrap">
            <Badge variant="solid" colorScheme="gray" size="xs">
              New
            </Badge>
            <Link href="#changelog" colorScheme="gray" variant="hover">
              <Flex as="span" alignItems="center" gap="1.5">
                <Text as="span" size="sm" weight="medium" color="brand-contrast">
                  Realtime collaboration is out of beta
                </Text>
                <Box as="span" color="brand-contrast">
                  <ArrowIcon />
                </Box>
              </Flex>
            </Link>
          </Flex>
        </Container>
      </Box>

      {/* ---- Bar ---- */}
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Flex alignItems="center" justifyContent="between" gap="8" h="16">
          <Flex alignItems="center" gap="10">
            <Flex alignItems="center" gap="2.5">
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
              <Text as="span" size="md" weight="semibold" letterSpacing="tight">
                Astralis
              </Text>
            </Flex>

            {/* Links sit next to the wordmark rather than centred, so the bar
                reads left-to-right as one group instead of three. */}
            <Flex
              as="nav"
              aria-label="Main"
              alignItems="center"
              gap="7"
              display={{ base: "hidden", lg: "flex" }}
            >
              {links.map((link) => (
                <NavLink key={link.label} {...link} />
              ))}
            </Flex>
          </Flex>

          <Flex alignItems="center" gap="3" display={{ base: "hidden", lg: "flex" }}>
            <Button size="sm" variant="text" colorScheme="gray">
              Sign in
            </Button>
            <Button size="sm" variant="surface" colorScheme="gray">
              Book a demo
            </Button>
            <Button size="sm">Start free</Button>
          </Flex>

          <Box
            as="button"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            display={{ base: "inline-flex", lg: "hidden" }}
            cursor="pointer"
            p="2"
            rounded="md"
            bg="transparent"
            hover={{ bg: "subtle" }}
            focusVisible={{ borderColor: "brand" }}
          >
            <MenuIcon open={open} />
          </Box>
        </Flex>
      </Container>

      {open && (
        <Box
          as="nav"
          aria-label="Main"
          borderT="normal"
          borderColor="subtle"
          display={{ base: "block", lg: "hidden" }}
        >
          <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
            <Stack direction="vertical" alignItems="stretch" gap="4" py="5">
              {links.map((link) => (
                <NavLink key={link.label} {...link} />
              ))}
              <Stack direction="vertical" alignItems="stretch" gap="2.5" pt="2">
                <Button size="md" variant="surface" colorScheme="gray" fullWidth>
                  Book a demo
                </Button>
                <Button size="md" fullWidth>
                  Start free
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  );
}
