"use client";

import { Icon, HStack, Text } from "astralis-ui";
import { Sparkles } from "lucide-react";

export function IconResponsive() {
  return (
    <HStack gap="3" alignItems="center">
      <Icon as={Sparkles} size={{ base: "sm", md: "lg", lg: 48 }} />
      <Text size="sm" color="muted">Small on a phone, large from md, 48px from lg.</Text>
    </HStack>
  );
}
