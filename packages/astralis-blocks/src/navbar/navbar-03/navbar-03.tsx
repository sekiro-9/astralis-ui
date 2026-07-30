"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Icon,
  Link,
  Separator,
  Stack,
  Text,
} from "astralis-ui";

const links = [
  { label: "Overview", href: "#overview" },
  { label: "Integrations", href: "#integrations" },
  { label: "Security", href: "#security" },
  { label: "Blog", href: "#blog" },
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

/** Neutral nav link — see navbar-01 for why the scheme is gray. */
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} colorScheme="gray" variant="plain" size="sm" weight="medium">
      {label}
    </Link>
  );
}

/**
 * Floating pill: the same bar contents inset from the page edges as a rounded,
 * bordered card rather than a full-bleed strip.
 *
 * The pill is `raised`, not `base` — it is a layer floating over the page, and
 * that is exactly the token's job: identical to base in light, one step lighter
 * in dark, where the shadow alone would not read.
 */
export function Navbar03() {
  const [open, setOpen] = useState(false);

  return (
    <Box as="header" position="sticky" top="0" zIndex="high" pt="4" pb="2">
      <Container maxW="5xl" px={{ base: "4", lg: "6" }}>
        <Box
          bg="raised"
          border="normal"
          borderColor="base"
          rounded="2xl"
          shadow="lg"
          overflow="hidden"
        >
          <Flex
            alignItems="center"
            justifyContent="between"
            gap="6"
            h="14"
            px={{ base: "4", lg: "5" }}
          >
            <Flex alignItems="center" gap="2.5">
              <Flex
                alignItems="center"
                justifyContent="center"
                shrink="0"
                size="7"
                rounded="md"
                bg="brand"
              >
                <Text as="span" size="xs" weight="semibold" color="brand-contrast">
                  A
                </Text>
              </Flex>
              <Text as="span" size="sm" weight="semibold" letterSpacing="tight">
                Astralis
              </Text>
            </Flex>

            <Flex
              as="nav"
              aria-label="Main"
              alignItems="center"
              gap="6"
              display={{ base: "hidden", md: "flex" }}
            >
              {links.map((link) => (
                <NavLink key={link.label} {...link} />
              ))}
            </Flex>

            <Box display={{ base: "hidden", md: "block" }}>
              <Button size="sm">Get started</Button>
            </Box>

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

          {open && (
            <Box as="nav" aria-label="Main" display={{ base: "block", md: "hidden" }}>
              <Separator />
              <Stack
                direction="vertical"
                alignItems="stretch"
                gap="4"
                px={{ base: "4", lg: "5" }}
                py="5"
              >
                {links.map((link) => (
                  <NavLink key={link.label} {...link} />
                ))}
                <Button size="md" fullWidth>
                  Get started
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
