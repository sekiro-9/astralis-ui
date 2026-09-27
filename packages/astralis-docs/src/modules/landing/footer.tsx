import Link from "next/link";
import { Logo } from "@/modules/site/logo";

const columns = [
  {
    title: "Docs",
    links: [
      { label: "Introduction", href: "/docs" },
      { label: "Components", href: "/docs/components/button" },
      { label: "Theming", href: "/docs/theming" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "CLI", href: "/docs/cli" },
      { label: "Blocks", href: "/blocks" },
      { label: "Theme builder", href: "/theme-builder" },
      { label: "AI assistants", href: "/docs/ai-agents" },
      { label: "DevTools", href: "/docs/devtools" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Issues & contributions", href: "/issues" },
      { label: "GitHub", href: "https://github.com/SekiroDev360/astralis-ui" },
    ],
  },
];

export function Footer({ version }: { version: string }) {
  return (
    <footer className="border-t border-stroke-base">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-12 px-6 py-20 sm:flex-row sm:justify-between lg:px-12">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-label-muted">
            A React component library with a stellar finish: semantic tokens,
            runtime theming, zero build step.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-16 gap-y-10">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-label-subtle">
                {column.title}
              </p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-label-muted transition-colors hover:text-label">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-stroke-base">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-6 text-xs text-label-subtle lg:px-12">
          <span>© 2026 Astralis UI</span>
          <span>astralis-ui v{version} · MIT</span>
        </div>
      </div>
    </footer>
  );
}
