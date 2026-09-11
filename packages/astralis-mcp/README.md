# astralis-mcp

MCP server for [Astralis UI](https://astralis-zeta.vercel.app) — lets AI
coding agents (Claude Code, Cursor, …) look up the library's **current**
component APIs, full props tables, runnable demo source, theming guides and
block sources instead of guessing from training data, and check the code they
write against the design system.

Reads the docs site's machine-readable endpoints and its block registry, so
answers can never drift from what the documentation actually ships.

## Setup

The quickest way is `npx astralis-cli connect-mcp`, which configures Claude
Code, Codex, Cursor, Claude Desktop or Antigravity for you.

**Claude Code** by hand:

```bash
claude mcp add astralis -- npx -y astralis-mcp
# Windows: claude mcp add astralis -- cmd /c npx -y astralis-mcp
```

**Any MCP client**, in its config (on Windows use `"command": "cmd"` and
`"args": ["/c", "npx", "-y", "astralis-mcp"]`):

```json
{
  "mcpServers": {
    "astralis": { "command": "npx", "args": ["-y", "astralis-mcp"] }
  }
}
```

No install step — `npx` fetches and runs it on demand. Needs Node `^22.18` or
`>=24.11`.

## Tools

All eight are read-only.

| Tool | What it returns |
| --- | --- |
| `list_components` | Every docs page, components and guides, with slug, title, description, section and kind |
| `get_component` | One component's full docs: props table, keyboard map, a11y notes, demo source |
| `get_guide` | A guide page, such as `installation`, `quick-start`, `theming` or `tokens` |
| `search_docs` | Full-text search across everything, with a snippet around each hit |
| `get_theming` | The complete theming + design-token reference in one call |
| `list_blocks` | Every block — prebuilt page sections — with id, description, category and the components it composes. Filterable by category |
| `get_block` | One block's metadata plus the complete source of its files, ready to write into a project |
| `validate_code` | Verdict on Astralis TSX against the design system's machine-readable spec — unknown components/parts, off-token values, dead `astralis:*` classes, anatomy and a11y mistakes, with actionable reasons. Prefers the spec of the astralis-ui installed in your project; no model involved |

When the docs site can't be reached, or answers with an error, every tool
returns an error result that says so — never "unknown component" or an empty
answer. Responses over 5 MB are refused.

## Options

| Env var | Default | Purpose |
| --- | --- | --- |
| `ASTRALIS_DOCS_URL` | `https://astralis-zeta.vercel.app` | Point at a local docs dev server (`http://localhost:3000`) when working on unpublished docs |

## License

MIT © Paul Andrew
