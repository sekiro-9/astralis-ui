"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Badge, Button, Drawer, Icon } from "astralis-ui";
import { navigation } from "@/lib/navigation";
import { navLinks } from "./nav-links";

/**
 * The only way into the site's navigation below `lg`.
 *
 * Both nav surfaces are desktop-gated — the header row is `md:flex` and the
 * docs sidebar is `lg:block` — so on a phone every link in the site was
 * unreachable. The drawer carries both: the top-level destinations, then the
 * full docs tree, since a reader on a component page needs the sidebar more
 * than the header row.
 *
 * Shown up to `lg` rather than `md`, because the sidebar is the surface that
 * disappears last. Between the two breakpoints the top-level links appear in
 * both places, which costs nothing and keeps one rule instead of two.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A drawer that survives the navigation it just triggered would cover the
  // page the reader asked for.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Drawer open={open} onOpenChange={setOpen} placement="left" size="sm">
      <Drawer.Trigger>
        <Button
          variant="text"
          colorScheme="gray"
          size="sm"
          aria-label="Open navigation"
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
          <nav className="flex flex-col gap-7 pb-8" aria-label="Site">
            <ul className="flex flex-col gap-px">
              {navLinks.map((link) => {
                const active = link.isActive(pathname);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center rounded-lg px-2.5 py-2 text-sm transition-colors ${
                        active
                          ? "bg-accent-subtle font-medium text-accent-label"
                          : "text-label-muted hover:bg-surface-subtle hover:text-label"
                      }`}
                    >
                      {link.title}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {navigation.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-label-subtle">
                  {group.title}
                </p>
                <ul className="flex flex-col gap-px">
                  {group.items.map((item) => {
                    if (item.status === "soon") {
                      return (
                        <li key={item.href}>
                          <span className="flex cursor-default items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-label-subtle">
                            {item.title}
                            <Badge variant="outline" size="xs" className="uppercase tracking-wider">
                              soon
                            </Badge>
                          </span>
                        </li>
                      );
                    }

                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                            active
                              ? "bg-accent-subtle font-medium text-accent-label"
                              : "text-label-muted hover:bg-surface-subtle hover:text-label"
                          }`}
                        >
                          {item.title}
                          {item.status === "new" && (
                            <Badge colorScheme="brand" size="xs" className="uppercase tracking-wider">
                              new
                            </Badge>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
