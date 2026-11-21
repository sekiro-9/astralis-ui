import type { ReactNode } from "react";
import { Heading, Text } from "astralis-ui";

/** A landing section's title, at the 4xl size's own line height. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Heading size="4xl" weight="semibold" lineHeight="size" color="base" textWrap="balance">
      {children}
    </Heading>
  );
}

/** The one-line lead under a section title; it may wrap below lg. */
export function SectionLead({ children }: { children: ReactNode }) {
  return (
    <Text mt="4" size="lg" color="muted" textWrap="balance" whiteSpace={{ lg: "nowrap" }}>
      {children}
    </Text>
  );
}
