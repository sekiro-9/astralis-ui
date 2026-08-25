import { Popout, Text } from "astralis-ui";

// No "use client" — a fully interactive anchored panel with no JavaScript:
// a native [popover] invoked by popovertarget, positioned by CSS anchor
// positioning against the trigger's implicit anchor.
export function PopoutDemo() {
  return (
    <Popout>
      <Popout.Trigger>What is this?</Popout.Trigger>
      <Popout.Content side="bottom" align="start">
        <Text size="sm">
          A zero-JS disclosure: top layer, Esc, light dismiss, and collision
          flipping all come from the platform.
        </Text>
      </Popout.Content>
    </Popout>
  );
}
