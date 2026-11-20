import type { ReactNode } from "react";
import { Text } from "astralis-ui";

/**
 * A landing section's title. A Text, not a Heading: Heading pins the line
 * height to `tight`, and this title keeps the 4xl size's own line height.
 */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    // Balanced wrapping has no prop.
    <Text as="h2" fontFamily="heading" size="4xl" weight="semibold" letterSpacing="tight" color="base" className="text-balance">
      {children}
    </Text>
  );
}

/** The one-line lead under a section title; it may wrap below lg. */
export function SectionLead({ children }: { children: ReactNode }) {
  return (
    // Balanced wrapping and white-space have no props.
    <Text mt="4" size="lg" color="muted" className="text-balance lg:whitespace-nowrap">
      {children}
    </Text>
  );
}
