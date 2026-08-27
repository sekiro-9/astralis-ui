import { TableOfContents, ScrollArea, Box, Heading, Text, HStack } from "astralis-ui";

const SECTIONS = [
  { id: "toc-demo-intro", title: "Introduction" },
  { id: "toc-demo-install", title: "Installation" },
  { id: "toc-demo-theming", title: "Theming", depth: 1 },
  { id: "toc-demo-tokens", title: "Tokens", depth: 1 },
  { id: "toc-demo-faq", title: "FAQ" },
];

export function TableOfContentsDemo() {
  return (
    <HStack gap="8" alignItems="start" w="full" maxW="2xl">
      <ScrollArea className="astralis:h-56 astralis:flex-1">
        {SECTIONS.map((s) => (
          <Box key={s.id} pb="8">
            <Heading as="h3" id={s.id} size="sm">
              {s.title}
            </Heading>
            <Text size="sm" color="muted" mt="2">
              Scroll this pane — the entry for the section under the header
              highlights on the right. The links are plain anchors, so they
              work before hydration too.
            </Text>
          </Box>
        ))}
      </ScrollArea>
      <TableOfContents items={SECTIONS} offset={0} className="astralis:w-40 astralis:shrink-0" />
    </HStack>
  );
}
