"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Button, Flex, Icon, Separator, Tag, Text, ThemeToggle } from "astralis-ui";
import { GithubMark } from "./github-mark";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { GITHUB_URL, navLinks as links } from "./nav-links";
import { Search } from "./search";

export function Header({ version }: { version: string }) {
  const pathname = usePathname();

  return (
    // A translucent surface, the blur behind it and the z-index level have no props.
    <Box as="header" position="sticky" top="0" borderB="normal" borderColor="base" className="z-50 bg-surface/75 backdrop-blur-xl">
      <Flex mx="auto" h="14" maxW="96rem" alignItems="center" justifyContent="between" px={{ base: "4", lg: "8" }}>
        <Flex alignItems="center" gap="8">
          <Logo />
          <Flex as="nav" display={{ base: "hidden", lg: "flex" }} alignItems="center" gap="1" aria-label="Main">
            {links.map((link) => {
              const active = link.isActive(pathname);
              return (
                <Flex
                  as={NextLink}
                  key={link.href}
                  href={link.href}
                  rounded="lg"
                  px="3"
                  py="1.5"
                  color={active ? "base" : "muted"}
                  hover={active ? undefined : { bg: "subtle", color: "base" }}
                  whiteSpace="nowrap"
                  className="transition-colors"
                >
                  <Text as="span" size="sm">
                    {link.title}
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        </Flex>

        <Flex alignItems="center" gap="2">
          <Search />
          {/* Read from astralis-ui's package.json, not typed in. It read
              0.2.0 for two releases after the library moved on. */}
          <Tag variant="subtle" colorScheme="brand">
            {version}
          </Tag>
          <Button
            as="a"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            colorScheme="gray"
            size="sm"
            aria-label="Astralis on GitHub"
            w="8"
            // Button takes no padding prop; the square icon button zeroes its own.
            className="px-0"
          >
            <Icon size={18} color="brand-solid">
              <GithubMark />
            </Icon>
          </Button>
          <Separator
            orientation="vertical"
            h="4"
            alignSelf="center"
            mx="1"
            display={{ base: "hidden", sm: "block" }}
          />
          <ThemeToggle variant="text" colorScheme="gray" size="sm" aria-label="Toggle theme" />
          <MobileNav version={version} />
        </Flex>
      </Flex>
    </Box>
  );
}
