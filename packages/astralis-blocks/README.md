# astralis-blocks

Section-level compositions of Astralis primitives: heroes, pricing tables, feature
grids, auth screens, dashboards. Blocks are **source, not exports**: nothing here is
bundled into `astralis-ui`. The CLI copies the files into a consumer's project, where
they own and edit them.

```bash
npx astralis-cli add pricing-01
```

This package is `private` and never published. It is the single source of truth for
three consumers: the docs gallery at `/blocks`, and, through the copy of the registry
the docs site serves at `/r`, the CLI's `add` command and the MCP server's block tools.

## Layout

```
src/{category}/{id}/
  {id}.tsx      the block: this exact file is what a consumer receives
  meta.ts       hand-authored metadata (id, category, name, description, tags)
```

```
src/hero/hero-01/
src/login/login-01/
src/dashboard/dashboard-04/
```

One level: a category holds numbered blocks. The build rejects anything else — a
leftover `meta.family`, a folder under `src/` that is not a category, or an id that
does not match its folder.

## Naming

- **category** is the section someone is shopping for: `hero`, `pricing`, `login`,
  `footer`. Not a business vertical: "marketing" tells a reader nothing. The list
  lives in `BLOCK_CATEGORIES` in `src/registry.ts`, and the build reads it from there;
  add a category there before creating its folder.
- **id** is always `{category}-{nn}`, zero-padded so `02` sorts before `10`. IDs stay
  boring on purpose: they are typed into a CLI and looked up in docs.
- **`meta.name`** is where a block gets to be descriptive ("Three cards with
  highlighted plan"). It is what the docs card shows.

A new variation of a section is the next number in its category.

## Authoring rules

The build script enforces these; a violation fails the build.

1. **Only import `astralis-ui`, `react`, or sibling files.** No `next/*`, no third-party
   packages, no data fetching. A copied block has to compile in any React project.
2. **No `astralis:` prefixed classes.** That prefix is internal plumbing. Blocks are
   written in the public consumer dialect: component props, `style`, or plain
   `className`. This makes every block a real dogfooding test of the public API — if a
   block needs the prefix to look right, the component API has a gap worth fixing.
3. **Content is literal.** No props API. Copy, stats and links are inline JSX the
   consumer edits directly. A hero with a 40-prop interface is worse than 60 lines of
   readable markup.
4. **One exported component per entry file**, named in PascalCase and living in
   `{id}.tsx`.
5. **Server-safe by default.** Add `"use client"` only when a block holds state or
   effects of its own. Compound parts (`Card.Body`, `Tabs.List`) and the flat exports
   (`CardBody`) both work in Server Components.

## Scripts

```bash
pnpm --filter astralis-blocks build           # regenerate every artifact below
pnpm --filter astralis-blocks check:registry  # fail if any artifact is stale or orphaned
pnpm --filter astralis-blocks test            # typecheck + check:registry + render smoke test
```

`build` generates, deterministically:

| Artifact | Consumer |
| --- | --- |
| `registry/index.json` | the catalogue, no source; served as the docs site's `/r/index.json` to `add --list` and the MCP server |
| `registry/blocks/{id}.json` | metadata plus file contents; served as `/r/{id}.json` to `add {id}` and the MCP server |
| `src/blocks.generated.ts` | the live component and metadata behind each id, for the docs gallery and previews |
| `src/sources.generated.ts` | verbatim source, for the docs code tab |

`files`, `component` and `uses` are derived from the source, never hand-written, so
`meta.ts` cannot drift from what the block actually does. `check:registry` also fails
on a registry JSON with no block behind it, which `add` would otherwise keep serving.

The smoke test server-renders every block against the built `astralis-ui`, so build
the library first (`pnpm --filter astralis-ui build`).

After adding or editing a block, run `build` and commit the regenerated artifacts
with it. The docs site regenerates its thumbnails and `/r` copy on its own build.
