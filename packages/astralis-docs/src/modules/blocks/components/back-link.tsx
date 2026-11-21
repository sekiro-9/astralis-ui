import NextLink from "next/link";
import { Icon, Link, Text } from "astralis-ui";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      as={NextLink}
      href={href}
      variant="plain"
      colorScheme="gray"
      w="fit"
      display="flex"
      // Link takes no flex-container props.
      className="items-center gap-1"
    >
      <Icon size="xs">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Icon>
      <Text as="span" size="sm" color="muted">
        {children}
      </Text>
    </Link>
  );
}
