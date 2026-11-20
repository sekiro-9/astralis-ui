"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button, Drawer, Icon, Stack } from "astralis-ui";
import { isNew, navigation } from "@/lib/navigation";
import { NavGroupLabel, NavItem, NewBadge } from "./nav-item";
import { navLinks } from "./nav-links";

/**
 * The only way into the site's navigation below `lg`.
 *
 * Both nav surfaces are desktop-gated (the header row is `md:flex` and the
 * docs sidebar is `lg:block`), so on a phone every link in the site was
 * unreachable. The drawer carries both: the top-level destinations, then the
 * full docs tree, since a reader on a component page needs the sidebar more
 * than the header row.
 *
 * Shown up to `lg`, where both surfaces take over. The header row waited
 * for `lg` too once Issues & Contributions made it too long for a tablet.
 */
export function MobileNav({ version }: { version: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A drawer that survives the navigation it just triggered would cover the
  // page the reader asked for. Adjusted during render rather than in an effect,
  // so the stale open frame is never committed.
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} placement="left" size="sm">
      <Drawer.Trigger>
        <Button
          variant="text"
          colorScheme="gray"
          size="sm"
          aria-label="Open navigation"
          // Button takes no display prop.
          className="lg:hidden"
        >
          <Icon as={Menu} size="sm" />
        </Button>
      </Drawer.Trigger>

      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Navigation</Drawer.Title>
          <Drawer.CloseButton />
        </Drawer.Header>

        <Drawer.Body>
          <Stack as="nav" gap="7" pb="8" aria-label="Site">
            <Stack as="ul" gap="1px">
              {navLinks.map((link) => (
                <NavItem key={link.href} href={link.href} active={link.isActive(pathname)} py="2">
                  {link.title}
                </NavItem>
              ))}
            </Stack>

            {navigation.map((group) => (
              <div key={group.title}>
                <NavGroupLabel px="2.5">{group.title}</NavGroupLabel>
                <Stack as="ul" gap="1px">
                  {group.items.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      active={pathname === item.href}
                      end={isNew(item, version) && <NewBadge />}
                    >
                      {item.title}
                    </NavItem>
                  ))}
                </Stack>
              </div>
            ))}
          </Stack>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
