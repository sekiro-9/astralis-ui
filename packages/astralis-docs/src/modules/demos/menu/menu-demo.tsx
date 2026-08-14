"use client";

import { Button, Kbd, Menu, toast, Toaster } from "astralis-ui";
import { Copy, Pencil, Settings, Trash2 } from "lucide-react";

export function MenuDemo() {
  const did = (what: string) => toast.info(what);

  return (
    <>
      <Toaster />
      <Menu>
        <Menu.Trigger>
          <Button variant="outline" colorScheme="gray">Actions</Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Label>Mission</Menu.Label>
          <Menu.Item icon={<Pencil style={{ width: "100%", height: "100%" }} />} shortcut={<Kbd size="sm">E</Kbd>} onSelect={() => did("Edit")}>
            Edit
          </Menu.Item>
          <Menu.Item icon={<Copy style={{ width: "100%", height: "100%" }} />} shortcut={<Kbd size="sm">⌘C</Kbd>} onSelect={() => did("Duplicate")}>
            Duplicate
          </Menu.Item>
          <Menu.Item icon={<Settings style={{ width: "100%", height: "100%" }} />} disabled>
            Configure
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item danger icon={<Trash2 style={{ width: "100%", height: "100%" }} />} onSelect={() => did("Deleted")}>
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
    </>
  );
}
