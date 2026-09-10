import { uiVersion } from "@/lib/ui-version";
import { PageNav } from "@/modules/site/page-nav";
import { Sidebar } from "@/modules/site/sidebar";
import { Toc } from "@/modules/site/toc";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex max-w-screen-2xl px-4 lg:px-8">
      <aside className="docs-scroll sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-stroke-base py-8 pr-3 lg:block">
        <Sidebar version={uiVersion} />
      </aside>

      <main className="min-w-0 flex-1 px-0 py-10 lg:px-12">
        {/* The search index reads only what is inside this marker. */}
        <article className="mx-auto max-w-3xl" data-pagefind-body>
          {children}
        </article>
        <PageNav />
      </main>

      <aside className="docs-scroll sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-10 xl:block">
        <Toc />
      </aside>
    </div>
  );
}
