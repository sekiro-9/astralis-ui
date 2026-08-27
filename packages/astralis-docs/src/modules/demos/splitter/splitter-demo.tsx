import { Splitter, Center, Text } from "astralis-ui";

export function SplitterDemo() {
  return (
    <Splitter defaultSize={35} minSize={20} maxSize={80} className="astralis:h-40 astralis:rounded-lg astralis:border-normal astralis:border-stroke-base astralis:overflow-hidden">
      <Splitter.Panel>
        <Center h="full" bg="surface-subtle">
          <Text size="sm" color="muted">Sidebar</Text>
        </Center>
      </Splitter.Panel>
      <Splitter.Handle aria-label="Resize sidebar" />
      <Splitter.Panel>
        <Center h="full">
          <Text size="sm" color="muted">Content — drag the divider, or focus it and use arrow keys</Text>
        </Center>
      </Splitter.Panel>
    </Splitter>
  );
}
