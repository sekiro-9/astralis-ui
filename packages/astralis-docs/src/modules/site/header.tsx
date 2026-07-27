"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator, Tag, ThemeToggle } from "astralis-ui";
import { Logo } from "./logo";

/**
 * Each link owns its own active test — "Docs" covers every guide page except
 * the component pages, which have their own entry, so the rule can't be
 * derived from the href alone.
 */
const links = [
  {
    title: "Docs",
    href: "/docs",
    isActive: (path: string) => path.startsWith("/docs") && !path.startsWith("/docs/components"),
  },
  {
    title: "Components",
    href: "/docs/components/button",
    isActive: (path: string) => path.startsWith("/docs/components"),
  },
  { title: "Blocks", href: "/blocks", isActive: (path: string) => path.startsWith("/blocks") },
  {
    title: "Theme Builder",
    href: "/theme-builder",
    isActive: (path: string) => path.startsWith("/theme-builder"),
  },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-stroke-subtle bg-surface/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((link) => {
              const active = link.isActive(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
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
          <Tag variant="subtle" colorScheme="brand">
            0.2.0
          </Tag>
          {/* Prefixed: vertical brings h-full + self-stretch, and only a
              prefixed class merges against them. */}
          <Separator
            orientation="vertical"
            className="mx-1 hidden sm:block astralis:h-4 astralis:self-center"
          />
          <ThemeToggle variant="text" colorScheme="gray" size="sm" aria-label="Toggle theme" />
        </div>
      </div>
    </header>
  );
}
