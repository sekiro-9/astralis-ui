"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, Icon, Text } from "astralis-ui";
import { navigation, type NavItem } from "@/lib/navigation";

/** Every docs page in sidebar order. The Blocks gallery lives outside /docs, so the chain skips it. */
const pages = navigation.flatMap((group) => group.items).filter((item) => item.href.startsWith("/docs"));

/** Previous and next page, straight from the sidebar's reading order. */
export function PageNav() {
  const pathname = usePathname();
  const index = pages.findIndex((page) => page.href === pathname);
  if (index === -1) return null;

  const previous = pages[index - 1];
  const next = pages[index + 1];

  return (
    <nav
      aria-label="Previous and next page"
      className="mx-auto mt-16 grid max-w-3xl gap-4 border-t border-stroke-base pt-8 sm:grid-cols-2"
    >
      {previous && <PageLink item={previous} direction="previous" />}
      {next && <PageLink item={next} direction="next" />}
    </nav>
  );
}

function PageLink({ item, direction }: { item: NavItem; direction: "previous" | "next" }) {
  const isNext = direction === "next";

  return (
    <NextLink
      href={item.href}
      rel={isNext ? "next" : "prev"}
      // Pinned to the right column, so a lone Next link on the first page still reads as "forward".
      className={`rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ring ${
        isNext ? "sm:col-start-2" : ""
      }`}
    >
      <Card variant="outline" size="sm" hoverable className="h-full">
        <Card.Body className={`flex flex-col gap-1 ${isNext ? "items-end text-right" : "items-start"}`}>
          <Text as="span" size="xs" color="muted" className="flex items-center gap-1">
            {!isNext && <Icon as={ArrowLeft} size="xs" />}
            {isNext ? "Next" : "Previous"}
            {isNext && <Icon as={ArrowRight} size="xs" />}
          </Text>
          <Text as="span" size="sm" weight="medium">
            {item.title}
          </Text>
        </Card.Body>
      </Card>
    </NextLink>
  );
}
