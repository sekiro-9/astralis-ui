/**
 * The site's top-level destinations, shared by the desktop header row and the
 * mobile drawer so the two can never drift.
 *
 * Each link owns its own active test — "Docs" covers every guide page except
 * the component pages, which have their own entry, so the rule can't be
 * derived from the href alone.
 */
export interface NavLink {
  title: string;
  href: string;
  isActive: (path: string) => boolean;
}

export const navLinks: NavLink[] = [
  {
    title: "Docs",
    href: "/docs",
    isActive: (path) => path.startsWith("/docs") && !path.startsWith("/docs/components"),
  },
  {
    title: "Components",
    href: "/docs/components/button",
    isActive: (path) => path.startsWith("/docs/components"),
  },
  { title: "Blocks", href: "/blocks", isActive: (path) => path.startsWith("/blocks") },
  {
    title: "Theme Builder",
    href: "/theme-builder",
    isActive: (path) => path.startsWith("/theme-builder"),
  },
];
