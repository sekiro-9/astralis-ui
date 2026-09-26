import { Splitter, Box, Center, Text } from "astralis-ui";

export function SplitterDemo() {
  return (
    <Box w="full" h="40" border="normal" borderColor="base" rounded="lg" overflow="hidden">
      <Splitter defaultSize={35} minSize={20} maxSize={80} style={{ height: "100%" }}>
        <Splitter.Panel>
          <Center h="full" bg="subtle">
            <Text size="sm" color="muted">Sidebar</Text>
          </Center>
        </Splitter.Panel>
        <Splitter.Handle aria-label="Resize sidebar" />
        <Splitter.Panel>
          <Center h="full">
            <Text size="sm" color="muted">Content: drag the divider, or focus it and use arrow keys</Text>
          </Center>
        </Splitter.Panel>
      </Splitter>
    </Box>
  );
}
