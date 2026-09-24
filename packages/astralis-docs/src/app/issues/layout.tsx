/**
 * Every issue page reads the database and the session on each request. Said
 * here rather than left to inference: a page that finds no database returns
 * early without reading a header, and would otherwise be prerendered at build
 * time as "not configured" and stay that way once a database is added.
 */
export const dynamic = "force-dynamic";

/**
 * The issue platform sits outside /docs, like the block gallery: its lists
 * and snapshots need more width than the docs article column. The container
 * matches the gallery's, so every top-level page starts on the same edge.
 */
export default function IssuesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="mx-auto max-w-screen-xl px-6 py-12 lg:px-12 lg:py-16">{children}</main>;
}
