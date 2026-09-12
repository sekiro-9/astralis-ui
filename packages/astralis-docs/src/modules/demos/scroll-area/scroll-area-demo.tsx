import { ScrollArea, Box, Text, VStack } from "astralis-ui";

// No "use client" — the scrollbars are the platform's own, restyled with CSS.
export function ScrollAreaDemo() {
  return (
    <ScrollArea style={{ width: "18rem", height: "12rem" }}>
      <VStack gap="0" alignItems="stretch">
        {Array.from({ length: 20 }, (_, i) => (
          <Box key={i} px="3" py="2" bg={i % 2 ? undefined : "subtle"}>
            <Text size="sm">Release note {String(i + 1).padStart(2, "0")}</Text>
          </Box>
        ))}
      </VStack>
    </ScrollArea>
  );
}
