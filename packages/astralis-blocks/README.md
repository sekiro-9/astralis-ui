# astralis-blocks

Section-level compositions of Astralis primitives — heroes, pricing tables, feature
grids, dashboards. Blocks are **source, not exports**: nothing here is bundled into
`astralis-ui`. The CLI copies the files into a consumer's project, where they own and
edit them.

This package is `private` and never published. It is the single source of truth for
four consumers: the CLI (`astralis add`), the docs gallery, the MCP server, and Studio.

## Layout

```
src/{category}/{family}/{id}/
  {id}.tsx      the block — this exact file is what a consumer receives
  meta.ts       hand-authored metadata
```

```
src/hero/hero-split/hero-split-01/
src/auth/login/login-01/
```

## Naming

Two levels, then a counter.

- **category** is the section someone is shopping for: `hero`, `pricing`, `auth`,
  `footer`. Not a business vertical — "marketing" tells a reader nothing and forces
  a second level of nesting before they reach anything useful.
- **family** is the structural skeleton within that section: `hero-split`,
  `hero-centered`, `login`. A family does not have to repeat its category —
  `auth/login` reads better than `auth/auth-login`.
- **id** is always `{family}-{nn}`, zero-padded so `02` sorts before `10`.

If you can name the difference structurally, add a new family. If it is the same
skeleton with a different visual treatment, increment the number. IDs stay boring on
purpose — they are typed into a CLI and looked up in docs. The descriptive name lives
in `meta.name` ("Split with framed product shot"), which is what the docs card shows.

## Authoring rules

The build script enforces these; a violation fails the build.

1. **Only import `astralis-ui`, `react`, or sibling files.** No `next/*`, no third-party
   packages, no data fetching. A copied block has to compile in any React project.
2. **No `astralis:` prefixed classes.** That prefix is internal plumbing. Blocks are
   written in the public consumer dialect: component props, `style`, or plain
   `className`. This makes every block a real dogfooding test of the public API — if a
   block needs the prefix to look right, the component API has a gap worth fixing.
3. **Content is literal.** No props API. Copy, stats, and links are inline JSX the
   consumer edits directly. A hero with a 40-prop interface is worse than 60 lines of
   readable markup.
4. **One exported component per entry file**, named in PascalCase, matching `{id}.tsx`.
5. **Server-safe by default.** Add `"use client"` only when a block actually needs
   state or effects.

## Build

```bash
pnpm --filter astralis-blocks build
```

Generates, deterministically:

| Artifact | Consumer |
| --- | --- |
| `registry/index.json` | docs listing, `astralis add --list` |
| `registry/blocks/{id}.json` | `astralis add {id}` — metadata + file contents |
| `src/blocks.generated.ts` | docs previews and Studio — the live component map |

`files`, `component`, and `uses` are derived from the source, never hand-written, so
`meta.ts` cannot drift from what the block actually does. `check:registry` fails when
the committed artifacts are stale.
