/**
 * Blocks live outside /docs on purpose: the docs layout caps its article at
 * `max-w-3xl`, and a page section previewed in a 48rem column is a lie.
 *
 * The container mirrors the landing sections (`max-w-screen-xl`, `px-6
 * lg:px-12`) so the gallery starts on the same left edge as the rest of the
 * site rather than hugging the header's wider gutter.
 */
export default function BlocksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto max-w-screen-xl px-6 py-12 lg:px-12 lg:py-16">{children}</main>
  );
}
