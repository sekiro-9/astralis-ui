"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Stack } from "astralis-ui";
import { isNew, navigation } from "@/lib/navigation";
import { NavGroupLabel, NavItem, NewBadge } from "./nav-item";

export function Sidebar({ version }: { version: string }) {
  const pathname = usePathname();
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  // Keep the active link visible: when a page loads (or navigation happens via
  // search/TOC/links) with the active item outside the sidebar's viewport,
  // scroll the sidebar (and only the sidebar) so the item sits near the top.
  useEffect(() => {
    const link = activeLinkRef.current;
    if (!link) return;

    let container: HTMLElement | null = link.parentElement;
    while (container && container.scrollHeight <= container.clientHeight) {
      container = container.parentElement;
    }
    if (!container) return;

    const linkTop =
      link.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    const outOfView =
      linkTop < container.scrollTop + 40 ||
      linkTop > container.scrollTop + container.clientHeight - 56;

    // Headroom above the link so its group label stays readable.
    if (outOfView) container.scrollTo({ top: Math.max(0, linkTop - 88) });
  }, [pathname]);

  return (
    <Stack as="nav" gap="7" pb="12" aria-label="Docs">
      {navigation.map((group) => (
        <div key={group.title}>
          <NavGroupLabel px="2.5">{group.title}</NavGroupLabel>
          <Stack as="ul" gap="1px">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  active={active}
                  ref={active ? activeLinkRef : undefined}
                  end={isNew(item, version) && <NewBadge />}
                >
                  {item.title}
                </NavItem>
              );
            })}
          </Stack>
        </div>
      ))}
    </Stack>
  );
}
