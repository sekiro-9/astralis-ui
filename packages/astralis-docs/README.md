# astralis-docs

The Astralis UI documentation site, deployed at
[astralis-ui.com](https://astralis-ui.com). A Next.js App Router
app with MDX pages, built on the library it documents: every surface uses
`astralis-ui` components through the package's public entry points, never its
internals.

It serves more than the pages people read:

- **Component and guide pages** under `/docs`, each with live demos whose code
  tab shows the file that is actually running.
- **The block gallery** at `/blocks`, and the block registry the CLI installs
  from, as static JSON at `/r/index.json` and `/r/{id}.json`.
- **The theme builder** at `/theme-builder`.
- **Machine-readable twins** for agents: every docs page as markdown at its URL
  plus `.md`, `/llms.txt`, `/llms-full.txt`, and `/system-spec.json`. The MCP
  server reads these.
- **Site search**, a Pagefind index built from each page's source, so it works in `dev` too.
- **Issues & Contributions** at `/issues`: a read-only view of the GitHub
  issues on `sekiro-9/astralis-ui`. Reports from the DevTools and
  `astralis report` are opened on GitHub from the reporter's own account; an
  issue that carries a report's snapshot shows it as a reproduction, checked by
  the validator. The site has no database and no accounts.

## Running it

From the workspace root (`astralis-ui/`), with pnpm:

```bash
pnpm install
pnpm --filter astralis-ui build     # the docs import the library's built dist/
pnpm --filter astralis-docs dev     # http://localhost:3000
```

The library is consumed as a workspace package, so after changing
`astralis-ui` rebuild it (or run its watch build) to see the change here.
Search only works against a production build: `dev` has no index.

### The Issues page

`/issues` reads GitHub's public API on the server, each answer cached for a
minute. Without a token GitHub allows 60 requests an hour, shared by everyone
on the same address (a Vercel deployment included), so set `GITHUB_TOKEN` to a
fine-grained token with read-only access to public repositories, locally in
`.env.local` and on Vercel. When GitHub cannot answer, the page says so and
links to the issues on GitHub.

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | Generates block thumbnails, the public registry and the search index, then starts `next dev` |
| `build` | The same generation, then `next build` |
| `start` | Serves a production build |
| `test` | Vitest over the site's pure logic: playground codegen, theme-builder seeds, the markdown twins, the landing numbers, and how the Issues page reads GitHub |
| `lint` | ESLint (Next's core-web-vitals and TypeScript configs) |
| `gen:thumbs` | Server-renders every block into a standalone HTML thumbnail in `public/block-thumbs/` |
| `gen:registry` | Copies the block registry from `astralis-blocks` into `public/r/` |
| `gen:search` | Indexes every docs page, from its source, and the block registry into `public/pagefind/`; runs before `dev` and `build` |

`public/block-thumbs/`, `public/r/` and `public/pagefind/` are generated and
git-ignored. Vercel runs the `build` script (see `vercel.json`), so the deploy
produces all three.

## Where things live

```
src/
  app/                    routes
    docs/                 guide pages (page.mdx) and docs/components/{slug}/page.mdx
    blocks/               gallery and block detail pages
    preview/blocks/[id]/  a bare render of one block, loaded in an iframe
    theme-builder/        the theme builder page
    llms.txt/ …           the machine-readable routes
    rsc-probe/            a Server Component page that fails the build if the
                          library's server boundary breaks; not linked anywhere
    issues/               the Issues pages: the list and an issue ([number])
  mdx-components.tsx      how MDX elements render (headings, code, tables)
  lib/
    navigation.ts         the sidebar tree: sidebar, mobile drawer, previous/next
                          links and llms.txt all read it
    docs-markdown.ts      MDX to plain markdown for the .md routes and llms files
    theme-builder.ts      the builder's presets, exports and seed sharing
    playground/           prop controls and code generation for Playground tabs
    issues/               reading GitHub: the list's filters and search, a
                          report's snapshot out of its issue, the fetching
                          (server-only), and the repro.tsx check
  modules/
    site/                 header, sidebar, mobile nav, TOC, search, page links
    docs/                 ComponentPreview, PropsTable, CodeBlock and friends
    demos/{component}/    every live example, plus each component's *-props.ts table
    landing/              the home page sections
    blocks/               gallery and detail page pieces
    theme-builder/        the builder UI
    issues/               the issue list, its filters, labels and the snapshot view
scripts/                  the generation steps listed above
```

To document a component: add its demos under `src/modules/demos/{component}/`
and register them in `src/modules/demos/index.ts`, write
`src/app/docs/components/{slug}/page.mdx`, and add the page to
`src/lib/navigation.ts`. A props table comes from a `*-props.ts` data file;
if it cannot be read, the build fails rather than shipping a broken table.
