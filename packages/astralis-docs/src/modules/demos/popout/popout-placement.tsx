import { Popout, HStack } from "astralis-ui";

export function PopoutPlacement() {
  return (
    <HStack gap="3" wrap="wrap" justifyContent="center">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Popout key={side}>
          <Popout.Trigger>{side}</Popout.Trigger>
          <Popout.Content side={side} align="center">
            Anchored {side}; flips when there is no room.
          </Popout.Content>
        </Popout>
      ))}
    </HStack>
  );
}
