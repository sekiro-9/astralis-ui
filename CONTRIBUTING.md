# Contributing to Astralis UI

Thanks for helping. Bug reports, fixes, docs improvements and new ideas are
all welcome. This guide covers how the repository is set up and what a change
needs before it can be merged.

## Reporting a bug

Open an issue with the **Bug report** template. The most useful reports name
the package and version, and include the smallest code that shows the
problem.

If the bug is in a component on your page, the CLI can capture it for you:

```bash
npx astralis-cli report src/App.tsx --out snapshot.json
```

This writes a snapshot of the Astralis components in the files you name
(their props, parts and validator findings, with your text replaced by
placeholders) that you can attach to the issue. With `--out`, nothing is sent
anywhere.

Security problems are different: please don't open a public issue. See
[SECURITY.md](SECURITY.md).

## Setting up

You need Node 22.18 or newer and pnpm 10 (`corepack enable` sets it up from
the version pinned in `package.json`).

```bash
git clone https://github.com/sekiro-9/astralis-ui.git
cd astralis-ui
pnpm install
pnpm build:ui
```

The [README](README.md) describes what each package in `packages/` is.

## Everyday commands

| Command | What it does |
| --- | --- |
| `pnpm build:ui` | Builds the library with all of its gates (types, CSS coverage, contrast, exports, server safety) |
| `pnpm dev:ui` | Storybook for the library on `localhost:6006` |
| `pnpm dev:docs` | The docs site on `localhost:3000` |
| `pnpm --filter astralis-ui test` | The library's unit and behaviour tests |
| `pnpm --filter astralis-ui lint` | ESLint for the library |
| `pnpm --filter astralis-docs test` | Docs tests, including props tables checked against the spec |
| `pnpm --filter astralis-cli test` | CLI tests (the same works for `astralis-mcp`, `astralis-devtools` and `create-astralis`) |

## Working on components

- The library ships precompiled CSS. After changing styles or tokens, rebuild
  with `pnpm build:ui`; the build fails if a class a component emits is
  missing from the stylesheet.
- Style through props and the library's tokens, not hard-coded colours. The
  contrast gate checks every colour pairing the theme promises.
- A component change usually touches three places: the component and its
  tests in `packages/astralis-ui`, its story, and its page and props data in
  `packages/astralis-docs`. The docs tests fail if a documented prop does not
  exist in the shipped types.
- Keep components accessible: keyboard behaviour, focus visibility and
  accessible names are part of the definition of done, and the docs page's
  keyboard section should match what the component does.

## Commits

One line, in the form `Area - What was done`:

```
Select - Escape closes only the listbox, not the surrounding dialog
Docs - Keyboard section for Splitter
```

Split work by concern: a fix and an unrelated refactor are two commits.
Small follow-up tweaks to the same piece fold into its commit.

## Pull requests

1. Branch from `main` and keep the change focused.
2. Add or update tests for behaviour you change.
3. For a user-facing change to the library, add a line under **Unreleased**
   in [packages/astralis-ui/CHANGELOG.md](packages/astralis-ui/CHANGELOG.md)
   (and in the changelog of any other package you change).
4. Make sure CI passes: it builds the library, runs its tests and builds the
   docs site.

The pull request template asks what changed, why, and how you tested it.

## Code of conduct

Everyone taking part is expected to follow the
[Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
