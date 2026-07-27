"use client";

import NextLink from "next/link";
import { Icon, Link, Text } from "astralis-ui";

/**
 * Client module on purpose. The library's `Link` takes a component through
 * `as`, and a component is a function — passing one from a Server Component
 * fails serialization ("Functions cannot be passed directly to Client
 * Components"). Declaring both sides on the client makes it an ordinary prop.
 */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      as={NextLink}
      href={href}
      variant="plain"
      colorScheme="gray"
      className="flex w-fit items-center gap-1"
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
