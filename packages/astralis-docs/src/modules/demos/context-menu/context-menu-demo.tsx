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
          border="normal"
          borderStyle="dashed"
          borderColor="base"
          style={{ userSelect: "none" }}
          tabIndex={0}
        >
          <Text size="sm" color="muted">
            Right-click this area, or focus it and press Shift+F10
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
