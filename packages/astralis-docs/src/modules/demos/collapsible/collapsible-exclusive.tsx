import { Collapsible, Box } from "astralis-ui";

// Collapsibles sharing a `name` form a native exclusive accordion: opening
// one closes its siblings, with zero JavaScript (`<details name>`).
export function CollapsibleExclusive() {
  return (
    <Box w="full" maxW="md">
      <Collapsible name="faq" defaultOpen>
        <Collapsible.Trigger>Only one of us stays open</Collapsible.Trigger>
        <Collapsible.Content>Open my sibling and I close.</Collapsible.Content>
      </Collapsible>
      <Collapsible name="faq">
        <Collapsible.Trigger>Try me</Collapsible.Trigger>
        <Collapsible.Content>The grouping is the name attribute.</Collapsible.Content>
      </Collapsible>
      <Collapsible name="faq">
        <Collapsible.Trigger>Or me</Collapsible.Trigger>
        <Collapsible.Content>Still no JavaScript.</Collapsible.Content>
      </Collapsible>
    </Box>
  );
}
