import { Collapsible, Box } from "astralis-ui";

// No "use client" — this demo IS a Server Component. The open/close behavior
// you're using is the browser's <details> element, not JavaScript.
export function CollapsibleDemo() {
  return (
    <Box w="full" maxW="md">
      <Collapsible defaultOpen>
        <Collapsible.Trigger>What ships to the browser?</Collapsible.Trigger>
        <Collapsible.Content>
          Nothing. This entire component renders to HTML on the server — the
          toggle you just used is the native details element.
        </Collapsible.Content>
      </Collapsible>
      <Collapsible>
        <Collapsible.Trigger>Does it work with JavaScript disabled?</Collapsible.Trigger>
        <Collapsible.Content>
          Yes — open, close, keyboard, and screen-reader state announcements
          are all platform behavior.
        </Collapsible.Content>
      </Collapsible>
    </Box>
  );
}
