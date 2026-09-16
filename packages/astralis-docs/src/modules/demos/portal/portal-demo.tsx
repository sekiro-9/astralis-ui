"use client";

import { useState } from "react";
import { Box, Button, Card, Portal, Text, VStack } from "astralis-ui";

export function PortalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Box overflow="hidden" p="4" rounded="lg" border="normal" borderColor="base" w="full" maxW="sm">
      <VStack gap="3" alignItems="start">
        <Text size="sm" color="muted">
          This box clips anything that overflows it. The card renders into the document body,
          so the clipping never reaches it.
        </Text>
        <Button size="sm" variant="outline" colorScheme="gray" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide the card" : "Show the card"}
        </Button>
      </VStack>
      {open && (
        <Portal>
          <Card position="fixed" bottom="6" right="6" zIndex="high">
            <Card.Body>
              <Text size="sm">Rendered in document.body, outside the box.</Text>
            </Card.Body>
          </Card>
        </Portal>
      )}
    </Box>
  );
}
