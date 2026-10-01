# Changelog

All notable changes to `astralis-cli`. Under 0.x, a minor version may contain
breaking changes; a patch never does.

Versions marked **internal** were set in the repository but never published to
npm. Their changes reached npm in the next published version.

## 0.5.0 (2026-10-01)

The first npm release since 0.4.0. It includes the internal versions 0.4.1 to
0.4.4 below. Requires Node `^22.18` or `>=24.11`.

### Added

- **`astralis report <files...>`** builds an issue snapshot of the Astralis
  components in the files you name (their props, parts and the validator's
  findings, with your text replaced by placeholders), prints the exact JSON,
  and sends it to the maintainers only when you confirm. `--out` writes it to
  a file instead and sends nothing.
- **`astralis init --ci`** pins astralis-cli, adds a `validate` script and
  writes a GitHub Actions workflow that checks every pull request.
  `validate --format github` annotates the pull request's lines.
- **`astralis init --devtools`** installs the Astralis DevTools and wires them
  into the root layout or `vite.config`. `create` adds them by default.
- **One command table.** Every command has `--help`; `-y`/`--yes` takes the
  default answer to every prompt; `--debug` prints a stack trace; a mistyped
  command suggests the right one; and errors never print a raw stack trace.
- The validator judges imports against the library's export list (so
  importing a type or `COLOR_SCHEMES` is no longer reported), skips type-only
  imports, and reports a component left without the children its type
  requires.
- Type declarations ship for the `validate` and `validate-core` exports.

### Changed

- `theme` renders with the project's own installed astralis-ui and checks
  contrast before writing, so `--strict-contrast` fails before a bad theme is
  written.
- Scaffolders and installs are spawned with argument arrays, and `create`
  passes its package manager and `--yes` on to `init` and the scaffolder.
- Entry-file imports are parsed with Babel: a new import goes after
  multi-line imports, merges into an existing named import, and the CLI never
  writes code it cannot parse.
- `connect-mcp` adds the server safely on Windows for Claude Code and Codex,
  keeps numbered backups of config files it changes, and no longer creates
  config folders for clients that are not installed.

### Fixed

- `add` refuses block ids and registry file paths that could write outside
  the project, and gives up on the registry after 10 seconds.

## 0.4.4 (2026-08-28, internal)

### Added

- The `astralis-cli/validate-core` export: the validator without Node APIs,
  for use in a browser.

## 0.4.3 (2026-08-24, internal)

### Added

- `astralis theme` checks every generated theme against the library's
  contrast contracts and names each failing pairing with its colours and
  ratio. `--strict-contrast` makes a failure a non-zero exit.

## 0.4.2 (2026-08-23, internal)

### Added

- `astralis validate` accepts the container-query breakpoint keys (`@sm` to
  `@xl`), with did-you-mean suggestions.

## 0.4.1 (2026-08-21, internal)

### Added

- **`astralis validate [paths...]`** checks TSX and JSX against the installed
  astralis-ui's `system-spec.json`: unknown components and parts, values
  outside a prop's set (with suggestions), CSS values that cannot be valid,
  props a component excludes, compound anatomy, and common accessibility
  mistakes. `--json` for CI, `--strict-tokens` to flag raw colours.
- The `astralis-cli/validate` export: the same validator for scripts and the
  MCP server.

## 0.4.0 (2026-08-10)

### Changed

- `astralis theme` writes `src/astralis-theme.css` when the project has a
  `src/` folder, and imports it into the entry point after
  `astralis-ui/styles.css`. `--no-import` leaves the entry point alone.

### Added

- `create` replaces the scaffolder's demo page with a welcome screen built
  from Astralis, so working setup is visible on the first `dev`.
  `--no-starter` opts out.

### Fixed

- Prompts run in a child process, so an interactive scaffolder started by
  `create` receives keystrokes (on Windows it never did).
- `create` no longer lets create-vite start a dev server that never exits and
  strands the setup step, and only offers React templates.
- `init` reports only what it actually changed.

## 0.3.0 (2026-08-08)

### Added

- **`astralis add <block...>`** copies a block's source into the project,
  with `--list`, `--dir`, `--overwrite`, `--dry-run` and `--registry`. Blocks
  go to `--dir`, then `blocksDir` in `astralis.json`, then
  `[src/]components/blocks`.

### Fixed

- Failures set the exit code instead of exiting abruptly, which on Windows
  reported 127 instead of 1 after any network request.

## 0.2.1 (2026-07-24)

### Changed

- `astralis mcp` is renamed **`astralis connect-mcp`** and becomes a guided
  flow that sets up the MCP server for Claude Code, Codex, Cursor, Claude
  Desktop or Antigravity.

## 0.2.0 (2026-07-23)

### Added

- `astralis theme` takes the whole theme seed: brand, neutral and status
  colours (`--gray`, `--error`, `--warning`, `--success`, `--info`), fonts,
  radius and type scale.

## 0.1.0 (2026-07-16)

The first release.

- `astralis create <name>` scaffolds a Next.js or Vite project and wires
  Astralis into it.
- `astralis init` wires astralis-ui into an existing project.
- `astralis theme <hex>` turns a brand colour into a static theme stylesheet.
- `astralis mcp` prints the MCP server configuration for AI clients, and
  `--write` adds it to Claude Desktop's config.
