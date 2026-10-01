# Changelog

All notable changes to `astralis-mcp`. Under 0.x, a minor version may contain
breaking changes; a patch never does.

## 0.4.0 (2026-10-01)

Requires Node `^22.18` or `>=24.11`.

### Added

- **`validate_code`** checks Astralis code an agent wrote against the design
  system and returns machine-readable errors with valid alternatives, so the
  agent can fix its code and check again. It uses the project's installed
  astralis-ui, or the docs site's `system-spec.json` when there is no
  project. Validation runs locally; the server never calls a model.

### Changed

- When the docs site cannot be reached, tools return an error, never
  "unknown" or an empty success.
- Responses are capped in size, `search_docs` searches one fetched corpus,
  and the remote spec is refreshed instead of cached forever.
- Tools are registered with read-only hints.

## 0.3.0 (2026-08-08)

### Added

- **`list_blocks`** and **`get_block`**, so an agent asked for a pricing
  section can use the block that exists. `get_block` returns the block's
  source as fenced code, ready to write to disk.

## 0.2.0 (2026-07-24)

### Changed

- The server reports one version, from its package.
- Tool descriptions cannot drift from the docs they describe.
- Fetched pages are cached with a time limit, and requests time out.

## 0.1.0 (2026-07-14)

The first release: an MCP server over stdio with `list_components`,
`get_component`, `get_guide`, `get_theming` and `search_docs`, reading the
live docs site. Set `ASTRALIS_DOCS_URL` to point it at a local docs server.
