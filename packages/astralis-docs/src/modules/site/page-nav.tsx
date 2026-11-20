"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, Flex, Grid, Icon, Stack, Text } from "astralis-ui";
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
    <Grid
      as="nav"
      aria-label="Previous and next page"
      mx="auto"
      mt="16"
      maxW="3xl"
      gap="4"
      borderT="normal"
      borderColor="base"
      pt="8"
      columns={{ sm: "2" }}
    >
      {previous && <PageLink item={previous} direction="previous" />}
      {next && <PageLink item={next} direction="next" />}
    </Grid>
  );
}

function PageLink({ item, direction }: { item: NavItem; direction: "previous" | "next" }) {
  const isNext = direction === "next";

  return (
    <Grid.Item
      as={NextLink}
      href={item.href}
      rel={isNext ? "next" : "prev"}
      rounded="xl"
      // Pinned to the right column, so a lone Next link on the first page still reads as "forward".
      colStart={isNext ? { sm: "2" } : undefined}
      // outline is not a stateable prop, so the focus ring stays classes.
      className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ring"
    >
      <Card variant="outline" size="sm" hoverable h="full">
        <Card.Body>
          <Stack gap="1" alignItems={isNext ? "end" : "start"}>
            <Flex as="span" alignItems="center" gap="1" color="muted">
              {!isNext && <Icon as={ArrowLeft} size="xs" />}
              <Text as="span" size="xs">
                {isNext ? "Next" : "Previous"}
              </Text>
              {isNext && <Icon as={ArrowRight} size="xs" />}
            </Flex>
            <Text as="span" size="sm" weight="medium" align={isNext ? "right" : undefined}>
              {item.title}
            </Text>
          </Stack>
        </Card.Body>
      </Card>
    </Grid.Item>
  );
}
