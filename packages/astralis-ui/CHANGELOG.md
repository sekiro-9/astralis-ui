# Changelog

Notable changes to astralis-ui. Versions before 0.7.0 predate this file;
their history lives in the git log.

## 0.7.2 — 2026-08-16

Server-first. The static half of the library now renders as true React
Server Components and ships **zero client JavaScript** — enforced by a
build gate, recorded per component in `system-spec.json` (`client:
"none" | "leaf" | "required"`), and labeled on every docs page. On an
identical benchmark page, Astralis ships 15 kB gzip of library JS beyond
the framework, vs 36 kB (shadcn/ui), 58 kB (MUI) and 95 kB (Chakra v3).

### Fixed

- Compound dot-access (`Card.Body`, `Table.Head`, `Stat.Label`, …) no
  longer resolves to `undefined` inside Server Components. Pages that
  compose compounds can prerender without `"use client"`.
- Children passed from a Server Component into client compounds (a
  `<Button>` inside `<Menu.Trigger>`, items inside `<Steps>` /
  `<Carousel>`) hydrate correctly. They arrive as lazy nodes, which the
  triggers and pipelines now resolve before cloning or counting.
- `AvatarBadge` now sizes to its own avatar instead of the group default.

### Changed — read before upgrading

- **Table parts outside a `<Table>` no longer throw.** They render with
  md defaults instead — the same quiet-fallback contract Card has always
  had. If you relied on the error, there is no replacement.
- **Compound inheritance reaches direct children only** for Stat,
  Timeline items, AvatarGroup, ButtonGroup, InputGroup and CodeBlock. A
  wrapper element between the root and a part means the part falls back
  to its defaults (the old context reached through wrappers). Card,
  Table, Timeline and DataList styling is applied through CSS on the
  root's data attributes and still reaches any depth.
- Internals: the nine static-compound contexts are gone (data attributes
  + server-side prop passing instead); `Button` no longer uses
  `forwardRef` — pass `ref` as a regular prop (React 19).

### Added

- `system-spec.json` gains a `client` field per component, and `props` —
  each component's own closed vocabularies (Button `variant`, Alert
  `status`, …) extracted from the shipped type declarations. `astralis
  validate` (astralis-cli ≥ 0.4.1) and the MCP `validate_code` tool
  reject invalid values with did-you-mean suggestions.
- `/rsc-probe` page in the docs: a Server Component rendering the entire
  static set — the end-to-end proof behind the 0 KB badges.

## 0.7.1 — 2026-08-13

- Arbitrary values on every style prop: non-token strings ride the same
  CSS-variable channel tokens use — `w="352px"`, `bg="oklch(0.7 0.1
  250)"`, `p="calc(100% - 2rem)"` — still zero-runtime, still
  responsive. Bare numbers warn (they are not valid CSS lengths).
- Style-prop types widened to `Token | (string & {})`: autocomplete
  still offers tokens first, arbitrary strings typecheck.

## 0.7.0 — 2026-08-13

The var-channel migration. Style props stopped enumerating one CSS class
per value; each prop now has one fixed class per breakpoint and the
value travels in a CSS custom property.

- styles.css: 1,283 kB → 290 kB raw (−77%), 142 kB → 33 kB gzip.
- Selector count 17,706 → 3,012; CSS build 11 s → 0.5 s.
- Interaction states (`hover` / `focus` / `active` payloads) work on all
  51 value props.
- A three-part coverage gate proves every token resolves to a compiled
  class before the build may publish.
