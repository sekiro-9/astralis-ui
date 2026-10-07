/**
 * The issues sit outside /docs, like the block gallery: their lists
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
