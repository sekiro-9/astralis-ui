import { EmptyState, Button } from "astralis-ui";
import { Inbox } from "lucide-react";

// No "use client" — EmptyState is pure composition and ships zero client JS.
export function EmptyStateDemo() {
  return (
    <EmptyState>
      <EmptyState.Indicator>
        <Inbox />
      </EmptyState.Indicator>
      <EmptyState.Title>No messages yet</EmptyState.Title>
      <EmptyState.Description>
        When someone writes to you, the conversation will show up here.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button size="sm">New message</Button>
        <Button size="sm" variant="outline" colorScheme="gray">
          Invite people
        </Button>
      </EmptyState.Actions>
    </EmptyState>
  );
}
