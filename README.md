# Astralis UI

A React 19 component library on semantic design tokens, with its tooling.
The library's own README is the reference:
**[packages/astralis-ui](packages/astralis-ui/README.md)**.

**Docs & live demos:** https://astralis-zeta.vercel.app

## Monorepo layout

| Package | What it is |
| --- | --- |
| [`packages/astralis-ui`](packages/astralis-ui) | The component library, published as `astralis-ui` |
| [`packages/astralis-cli`](packages/astralis-cli) | `astralis` CLI: set up a project, add blocks, generate a theme, validate code against the design system |
| [`packages/astralis-mcp`](packages/astralis-mcp) | MCP server that gives AI coding agents the docs and a `validate_code` tool |
| [`packages/create-astralis`](packages/create-astralis) | `npm create astralis`: a new Next.js or Vite project with Astralis wired in |
| [`packages/astralis-blocks`](packages/astralis-blocks) | Source registry of section-level blocks, delivered as copy-in source by the CLI (private) |
| [`packages/astralis-docs`](packages/astralis-docs) | The documentation site, Next.js + MDX (private) |

## Development

Requires Node 22.18 or newer (the CLI's parser needs it; the library alone
runs on 20.9+) and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm build:ui      # build the library, with its CSS, contrast and export gates
pnpm dev:ui        # library Storybook on localhost:6006
pnpm dev:docs      # docs site on localhost:3000
```

The library ships precompiled CSS, so after changing component styles or
tokens, rebuild with `pnpm build:ui`. The build fails if any emitted class is
missing from the stylesheet.

## License

MIT © Paul Andrew. See [LICENSE](LICENSE).
