"use client";

import { Box, FloatingButton, Icon, Text, VStack } from "astralis-ui";
import { MessageCircle } from "lucide-react";

/*
 * The `transform: translateZ(0)` on the panel is load-bearing: a transformed
 * ancestor becomes the containing block for `position: fixed`, so the button
 * pins to this panel instead of the real viewport. Dragging is disabled in
 * these contained demos: the drag math works in viewport coordinates, which a
 * containing block deliberately breaks.
 */
export function FloatingButtonDemo() {
  return (
    <Box
      position="relative"
      h="56"
      w="full"
      maxW="md"
      overflow="hidden"
      rounded="xl"
      border="normal"
      borderColor="subtle"
      bg="subtle"
      style={{ transform: "translateZ(0)" }}
    >
      <VStack gap="2" p="5" alignItems="start">
        <Text size="xl" weight="medium">
          Your app
        </Text>
        <Text size="sm" color="muted">
          The button floats above the content, pinned to a corner.
        </Text>
      </VStack>
      <FloatingButton
        draggable={false}
        aria-label="Open chat"
        leftIcon={<Icon as={MessageCircle} size="sm" />}
      >
        Chat
      </FloatingButton>
    </Box>
  );
}
