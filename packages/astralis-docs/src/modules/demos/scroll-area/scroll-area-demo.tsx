import { ScrollArea, Box, Text, VStack } from "astralis-ui";

// No "use client" — the scrollbars are the platform's own, restyled with CSS.
export function ScrollAreaDemo() {
  return (
    <ScrollArea className="astralis:h-48" style={{ width: "18rem" }}>
      <VStack gap="0" alignItems="stretch">
        {Array.from({ length: 20 }, (_, i) => (
          <Box key={i} px="3" py="2" className={i % 2 ? "" : "astralis:bg-surface-subtle"}>
            <Text size="sm">Release note {String(i + 1).padStart(2, "0")}</Text>
          </Box>
        ))}
      </VStack>
    </ScrollArea>
  );
}
