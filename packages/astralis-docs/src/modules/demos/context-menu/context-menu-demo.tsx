import { ContextMenu, Center, Text } from "astralis-ui";

export function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenu.Trigger>
        <Center
          w="full"
          maxW="md"
          h="32"
          rounded="lg"
          className="astralis:border-normal astralis:border-dashed astralis:border-stroke-base astralis:select-none"
        >
          <Text size="sm" color="muted">
            Right-click anywhere in this area
          </Text>
        </Center>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item shortcut="⌘C">Copy</ContextMenu.Item>
        <ContextMenu.Item shortcut="⌘V">Paste</ContextMenu.Item>
        <ContextMenu.Item>Rename</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item danger>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
}
