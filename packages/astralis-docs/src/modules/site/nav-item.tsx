import NextLink from "next/link";
import type { ReactNode, Ref } from "react";
import { Badge, Box, Flex, Text } from "astralis-ui";

/** One row of the docs navigation, shared by the sidebar and the mobile drawer. */
export function NavItem({
  href,
  active,
  py = "1.5",
  end,
  ref,
  children,
}: {
  href: string;
  active: boolean;
  py?: "1.5" | "2";
  /** Shown at the row's far end, such as a "new" badge. */
  end?: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
  children: ReactNode;
}) {
  return (
    <li>
      {/* A Flex, so the label is a flex item and the row is as tall as its text, not as a line of body copy. */}
      <Flex
        as={NextLink}
        href={href}
        ref={ref}
        aria-current={active ? "page" : undefined}
        alignItems="center"
        justifyContent="between"
        rounded="lg"
        px="2.5"
        py={py}
        bg={active ? "brand-subtle" : undefined}
        color={active ? "brand-label" : "muted"}
        hover={active ? undefined : { bg: "subtle", color: "base" }}
        className="transition-colors"
      >
        {/* No colour here: color="inherit" would take the row's resting colour and miss its hover colour. */}
        <Text as="span" size="sm" weight={active ? "medium" : "normal"}>
          {children}
        </Text>
        {end}
      </Flex>
    </li>
  );
}

export function NewBadge() {
  return (
    // Badge takes no casing or letter-spacing prop.
    <Badge colorScheme="brand" size="xs" className="uppercase tracking-wider">
      new
    </Badge>
  );
}

/** The small uppercase label over a group of links. */
export function NavGroupLabel({ mb = "2", px, children }: { mb?: "2" | "3"; px?: "2.5"; children: ReactNode }) {
  return (
    // 11px and 0.12em sit off the type scale, so the label's type is set with classes.
    <Box as="p" mb={mb} px={px} color="subtle" className="text-[11px] font-semibold uppercase tracking-[0.12em]">
      {children}
    </Box>
  );
}
