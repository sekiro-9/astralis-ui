import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu, ContextMenu } from "./index";
import { Button } from "../buttons/button";
import { Kbd } from "../typography/kbd";
import { Text } from "../typography/text";

/**
 * Menu is an action menu on the APG menu-button pattern: ArrowDown opens on
 * the first item and ArrowUp on the last, arrows and typeahead rove, Escape
 * and outside presses dismiss through the shared overlay stack.
 */
const meta: Meta<typeof Menu> = {
  title: "Components/Overlay/Menu",
  component: Menu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Basic: Story = {
  render: () => (
    <Menu>
      <Menu.Trigger>
        <Button variant="outline" colorScheme="gray">Actions</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Label>File</Menu.Label>
        <Menu.Item shortcut={<Kbd>⌘E</Kbd>}>Edit</Menu.Item>
        <Menu.Item shortcut={<Kbd>⌘D</Kbd>}>Duplicate</Menu.Item>
        <Menu.Item disabled>Archive</Menu.Item>
        <Menu.Separator />
        <Menu.Item danger>Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

/**
 * ContextMenu is Menu opened by right-click (or the context-menu key), placed
 * at the pointer.
 */
export const Context: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenu.Trigger>
        <div
          style={{ display: "grid", placeItems: "center", width: 320, height: 160, border: "1px dashed", borderRadius: 12 }}
        >
          <Text size="sm">Right-click here</Text>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item>Rename</ContextMenu.Item>
        <ContextMenu.Item>Copy link</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item danger>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  ),
};
