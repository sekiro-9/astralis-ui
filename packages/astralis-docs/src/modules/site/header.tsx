"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator, Tag, ThemeToggle } from "astralis-ui";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { navLinks as links } from "./nav-links";
import { Search } from "./search";

export function Header({ version }: { version: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-stroke-base bg-surface/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {links.map((link) => {
              const active = link.isActive(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "text-label"
                      : "text-label-muted hover:bg-surface-subtle hover:text-label"
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Search />
          {/* Read from astralis-ui's package.json, not typed in — it read
              0.2.0 for two releases after the library moved on. */}
          <Tag variant="subtle" colorScheme="brand">
            {version}
          </Tag>
          <Separator
            orientation="vertical"
            h="4"
            alignSelf="center"
            className="mx-1 hidden sm:block"
          />
          <ThemeToggle variant="text" colorScheme="gray" size="sm" aria-label="Toggle theme" />
          <MobileNav version={version} />
        </div>
      </div>
    </header>
  );
}
