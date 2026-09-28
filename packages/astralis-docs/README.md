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
- **Site search**, a Pagefind index built from each page's source, so it works in `dev` too.
- **Issues & Contributions** at `/issues`, the issue platform: it takes the
  snapshots the DevTools and `astralis report` send, as private drafts at
  `POST /api/issues/drafts`, and turns them into public issues once the
  reporter signs in with GitHub. It is the only part of the site with a
  database and accounts.

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

### The issue platform

The rest of the site needs nothing more. `/issues` needs Postgres and, to
sign in, a GitHub OAuth app; without them it says it is not configured, and
the build still succeeds.

```bash
cp .env.example .env.local   # then fill it in; the file explains each value
docker compose up -d         # Postgres 17 on 127.0.0.1:5433, for development only
pnpm db:migrate              # creates the tables
```

The GitHub OAuth app's callback URL is `<BETTER_AUTH_URL>/api/auth/callback/github`.
In production, set the same variables on Vercel with a hosted Postgres, and
run `pnpm db:migrate` against it before deploying a change to the schema.

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | Generates block thumbnails, the public registry and the search index, then starts `next dev` |
| `build` | The same generation, then `next build` |
| `start` | Serves a production build |
| `test` | Vitest over the site's pure logic: playground codegen, theme-builder seeds, the markdown twins, the landing numbers, the issue platform's fingerprints, draft checks and filters |
| `test:db` | The issue platform's queries against real Postgres, in a separate `astralis_issues_test` database; needs `docker compose up -d` |
| `db:generate` | Writes a migration after a change to `src/server/db/schema.ts` |
| `db:migrate` | Applies the migrations to `DATABASE_URL` |
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
    issues/               the issue platform's pages: the list, a draft
                          (new?draft=), an issue ([ref]), the account page, and
                          the server actions they submit to
    api/issues/drafts/    where the DevTools and the CLI send a snapshot
    api/auth/             Better Auth (GitHub sign-in)
  mdx-components.tsx      how MDX elements render (headings, code, tables)
  lib/
    navigation.ts         the sidebar tree: sidebar, mobile drawer, previous/next
                          links and llms.txt all read it
    docs-markdown.ts      MDX to plain markdown for the .md routes and llms files
    theme-builder.ts      the builder's presets, exports and seed sharing
    playground/           prop controls and code generation for Playground tabs
    issues/               the issue platform's pure logic: statuses, the
                          fingerprint, the draft endpoint's checks, list filters
  server/                 server-only code for the issue platform: the database
                          schema and migrations, auth, and the queries
  modules/
    site/                 header, sidebar, mobile nav, TOC, search, page links
    docs/                 ComponentPreview, PropsTable, CodeBlock and friends
    demos/{component}/    every live example, plus each component's *-props.ts table
    landing/              the home page sections
    blocks/               gallery and detail page pieces
    theme-builder/        the builder UI
    issues/               the issue platform's lists, forms and snapshot view
scripts/                  the generation steps listed above
```

To document a component: add its demos under `src/modules/demos/{component}/`
and register them in `src/modules/demos/index.ts`, write
`src/app/docs/components/{slug}/page.mdx`, and add the page to
`src/lib/navigation.ts`. A props table comes from a `*-props.ts` data file;
if it cannot be read, the build fails rather than shipping a broken table.
