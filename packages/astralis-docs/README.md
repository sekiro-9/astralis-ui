# astralis-docs

The Astralis UI documentation site, deployed at
[astralis-zeta.vercel.app](https://astralis-zeta.vercel.app). A Next.js App Router
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
- **Site search**, a Pagefind index built from the prerendered pages.

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

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | Generates block thumbnails and the public registry, then starts `next dev` |
| `build` | The same generation, `next build`, then the search index |
| `start` | Serves a production build |
| `test` | Vitest over the site's pure logic: playground codegen, theme-builder seeds, the markdown twins, the landing numbers |
| `lint` | ESLint (Next's core-web-vitals and TypeScript configs) |
| `gen:thumbs` | Server-renders every block into a standalone HTML thumbnail in `public/block-thumbs/` |
| `gen:registry` | Copies the block registry from `astralis-blocks` into `public/r/` |
| `gen:search` | Indexes the prerendered docs pages and the block registry into `public/pagefind/`; needs `next build` output |

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
  mdx-components.tsx      how MDX elements render (headings, code, tables)
  lib/
    navigation.ts         the sidebar tree: sidebar, mobile drawer, previous/next
                          links and llms.txt all read it
    docs-markdown.ts      MDX to plain markdown for the .md routes and llms files
    theme-builder.ts      the builder's presets, exports and seed sharing
    playground/           prop controls and code generation for Playground tabs
  modules/
    site/                 header, sidebar, mobile nav, TOC, search, page links
    docs/                 ComponentPreview, PropsTable, CodeBlock and friends
    demos/{component}/    every live example, plus each component's *-props.ts table
    landing/              the home page sections
    blocks/               gallery and detail page pieces
    theme-builder/        the builder UI
scripts/                  the generation steps listed above
```

To document a component: add its demos under `src/modules/demos/{component}/`
and register them in `src/modules/demos/index.ts`, write
`src/app/docs/components/{slug}/page.mdx`, and add the page to
`src/lib/navigation.ts`. A props table comes from a `*-props.ts` data file;
if it cannot be read, the build fails rather than shipping a broken table.
