import type { ReactNode } from "react";
import { Heading, Text } from "astralis-ui";

/** A landing section's title, at the 4xl size's own line height. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    // Balanced wrapping has no prop.
    <Heading size="4xl" weight="semibold" lineHeight="size" color="base" className="text-balance">
      {children}
    </Heading>
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
