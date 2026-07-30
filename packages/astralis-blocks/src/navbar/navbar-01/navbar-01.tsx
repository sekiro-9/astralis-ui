"use client";

import { useState } from "react";
import {
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
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
  { label: "Changelog", href: "#changelog" },
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

/**
 * `colorScheme="gray"` rather than the default brand: a nav link is neutral
 * text that darkens on hover, not an accent link. Size and weight go straight
 * on the Link, which carries Text's typography props.
 */
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} colorScheme="gray" variant="plain" size="sm" weight="medium">
      {label}
    </Link>
  );
}

function Wordmark() {
  return (
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
  );
}

/**
 * Sticky bar: wordmark, inline links, then sign-in and a call to action. Links
 * and actions collapse into a disclosure panel below `md`.
 *
 * The hairlines are one-sided borders: `borderB` on the bar, `borderT` on the
 * panel, so each rule belongs to the element it bounds rather than being an
 * extra node between them.
 */
export function Navbar01() {
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
      <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
        <Flex alignItems="center" justifyContent="between" gap="6" h="16">
          <Wordmark />

          {/* Inline links — hidden below md, where the panel takes over. */}
          <Flex
            as="nav"
            aria-label="Main"
            alignItems="center"
            gap="7"
            display={{ base: "hidden", md: "flex" }}
          >
            {links.map((link) => (
              <NavLink key={link.label} {...link} />
            ))}
          </Flex>

          <Flex alignItems="center" gap="3" display={{ base: "hidden", md: "flex" }}>
            <Button size="sm" variant="text" colorScheme="gray">
              Sign in
            </Button>
            <Button size="sm">Get started</Button>
          </Flex>

          {/* Local state only — wire the links to your own routing. */}
          <Box
            as="button"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            display={{ base: "inline-flex", md: "hidden" }}
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
          display={{ base: "block", md: "hidden" }}
        >
          <Container maxW="6xl" px={{ base: "6", lg: "8" }}>
            <Stack direction="vertical" alignItems="stretch" gap="4" py="5">
              {links.map((link) => (
                <NavLink key={link.label} {...link} />
              ))}
              <Stack direction="vertical" alignItems="stretch" gap="2.5" pt="2">
                <Button size="md" variant="surface" colorScheme="gray" fullWidth>
                  Sign in
                </Button>
                <Button size="md" fullWidth>
                  Get started
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  );
}
