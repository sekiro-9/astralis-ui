import { Badge, Box, Flex, Text } from "astralis-ui";

import type { IssueState, Label } from "@/lib/issues/github";

const STATES: Record<IssueState, { label: string; scheme: "green" | "purple" | "gray" }> = {
  open: { label: "Open", scheme: "green" },
  done: { label: "Closed", scheme: "purple" },
  "not-planned": { label: "Not planned", scheme: "gray" },
};

export function StateBadge({ state }: { state: IssueState }) {
  const { label, scheme } = STATES[state];
  return (
    <Badge variant="subtle" colorScheme={scheme}>
      {label}
    </Badge>
  );
}

/**
 * A GitHub label, in its own colour. The colour is a dot rather than the
 * fill, so a pale or dark label reads the same in light and dark mode; it is
 * passed as a raw value because it is data, not a token the CSS build can know.
 */
export function LabelTag({ label }: { label: Label }) {
  return (
    <Flex as="span" display="inline-flex" alignItems="center" gap="1.5" px="2" py="0.5" rounded="full" border="normal" borderColor="base">
      <Box as="span" aria-hidden size="2" rounded="full" bg={`#${label.color}`} />
      <Text as="span" size="xs" color="muted">
        {label.name}
      </Text>
    </Flex>
  );
}
