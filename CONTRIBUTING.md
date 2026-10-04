# Contributing to Astralis UI

Thanks for taking the time to help. Bug reports, fixes, documentation, new
blocks and ideas all make Astralis better, and every one of them is welcome.

This guide covers how the repository is laid out, how to run it, and what a
change needs before it can be merged.

- [Ways to contribute](#ways-to-contribute)
- [Before you start](#before-you-start)
- [Repository layout](#repository-layout)
- [Setting up](#setting-up)
- [Everyday commands](#everyday-commands)
- [Working on a component](#working-on-a-component)
- [Working on a block](#working-on-a-block)
- [Working on the tooling](#working-on-the-tooling)
- [When the build fails](#when-the-build-fails)
- [Commits and branches](#commits-and-branches)
- [Pull requests](#pull-requests)
- [Releases](#releases)

## Ways to contribute

- **Report a bug** with the [bug report form](https://github.com/sekiro-9/astralis-ui/issues/new?template=1.bug.yml).
  The smallest code that shows the problem is the most useful thing you can
  include. For a component bug, the CLI can capture one for you:

  ```bash
  npx astralis-cli report src/App.tsx --out snapshot.json
  ```

  It records the Astralis components in that file (their props, parts and
  any problems the validator finds), with your text replaced by placeholders.
  With `--out` nothing is sent; attach the file to the issue.

- **Suggest a feature** with the [feature request form](https://github.com/sekiro-9/astralis-ui/issues/new?template=2.feature.yml):
  a component, a prop, a block, or something in the tooling.
- **Improve the docs**: a confusing sentence, a missing example or a wrong
  prop description is worth a pull request on its own.
- **Fix a bug or build a feature**: see below.

Security problems are the exception: please don't open a public issue. Follow
the [security policy](SECURITY.md) instead.

## Before you start

For anything bigger than a small fix, open an issue first and describe what
you have in mind. A short conversation up front saves you from building
something that does not fit, and lets us point you at the right files.

Issues labelled **good first issue** are a good way in. Comment on one before
you start so two people don't work on the same thing.

## Repository layout

A pnpm workspace:

```
packages/
  astralis-ui/        the component library (published as astralis-ui)
    src/components/   one folder per component, grouped by category
    src/theme/        the provider, tokens and theme maths
    scripts/          the build gates and generators
  astralis-cli/       the astralis command (published as astralis-cli)
  create-astralis/    npm create astralis
  astralis-mcp/       the MCP server for AI assistants
  astralis-devtools/  the development overlay
  astralis-blocks/    ready-made sections, copied into projects by the CLI
  astralis-docs/      the documentation site at astralis-ui.com (Next.js + MDX)
bench/                bundle and hydration benchmarks
```

## Setting up

You need:

- **Node** `^22.18` or `>=24.11`
- **pnpm 10**: `corepack enable` installs the version pinned in `package.json`
- **Git**

Fork the repository, then:

```bash
git clone https://github.com/<your-username>/astralis-ui.git
cd astralis-ui
pnpm install
pnpm build:ui
```

`pnpm build:ui` builds the library, which the docs site and the tooling use.
Run it again whenever you change the library and want the docs to see it.

## Everyday commands

| Command | What it does |
| --- | --- |
| `pnpm dev:docs` | The docs site on `localhost:3000` |
| `pnpm dev:ui` | The library's Storybook on `localhost:6006` |
| `pnpm build:ui` | Builds the library and runs every build gate |
| `pnpm --filter astralis-ui test` | The library's unit and behaviour tests (Vitest) |
| `pnpm --filter astralis-ui lint` | ESLint for the library |
| `pnpm --filter astralis-docs test` | Docs tests, including every props table checked against the real types |
| `pnpm --filter astralis-blocks test` | Type-checks every block and renders it |
| `pnpm --filter astralis-cli test` | CLI tests; the same works for `astralis-mcp`, `astralis-devtools` and `create-astralis` |

## Working on a component

Each component lives in its own folder, with the same files everywhere:

```
packages/astralis-ui/src/components/data-display/badge/
  badge.tsx           the component
  badge.types.ts      its props, with a doc comment on each
  badge.styles.ts     its variants
  badge.stories.tsx   Storybook stories
  badge.test.tsx      tests
  index.ts            exports (compound parts go in components/)
```

A change to a component usually touches its documentation too:

```
packages/astralis-docs/src/app/docs/components/badge/page.mdx    the page
packages/astralis-docs/src/modules/demos/badge/                  its live examples
packages/astralis-docs/src/modules/demos/badge/badge-props.ts    the props table
packages/astralis-docs/src/lib/navigation.ts                     the sidebar entry
```

A few rules keep the library consistent:

- **Style with tokens, not hard-coded colours.** Colours come from the theme,
  so they follow the brand colour and dark mode, and the contrast gate can
  check them.
- **Accessibility is part of done.** Follow the component's WAI-ARIA pattern,
  keep focus visible, give controls accessible names, and describe the
  keyboard behaviour on the docs page.
- **Keep the props table true.** The docs tests fail if a documented prop
  does not exist in the shipped types.
- **Server-first.** If a component can render without client JavaScript, keep
  it that way; the build checks a list of components that must stay
  zero-client.
- **Add a changelog line** under **Unreleased** in
  [packages/astralis-ui/CHANGELOG.md](packages/astralis-ui/CHANGELOG.md) for
  anything users will notice.

## Working on a block

Blocks are ready-made page sections in `packages/astralis-blocks`, one folder
each:

```
packages/astralis-blocks/src/hero/hero-01/
  hero-01.tsx    the block: exactly what a project receives from `astralis add`
  meta.ts        its name, description and tags
```

A new block is the next number in its category. The build enforces three
rules, because a block has to compile in anyone's project:

1. Import only from `astralis-ui`, `react`, or sibling files.
2. Use the public API only: component props, `style` and `className`.
3. Keep content literal. A block is markup to edit, not a component with props.

The [blocks README](packages/astralis-blocks/README.md) has the details.

## Working on the tooling

- **astralis-cli**: commands live in `src/commands/`, and the command table
  in `src/lib/commands.mjs` drives `--help`, the README and the docs page.
  After changing a command's options, run `node scripts/reference.mjs` in
  `packages/astralis-cli` to regenerate the reference; a test checks they
  match.
- **astralis-mcp**: one file, `server.mjs`. Point it at a local docs server
  with `ASTRALIS_DOCS_URL=http://localhost:3000`.
- **astralis-devtools**: `src/client/` is the overlay, `src/bridge/` the local
  bridge, and `src/next/` and `vite.mjs` the framework adapters. Try it in a
  project made with `npm create astralis`.

## When the build fails

`pnpm build:ui` runs a set of gates. Each one catches a mistake that would
otherwise reach users silently.

| Failure | What it means | How to fix it |
| --- | --- | --- |
| Type errors | The library does not type-check. | Fix the reported error; the build stops before bundling. |
| **Token sync** | A generated stylesheet no longer matches the token tables it comes from. | Change the tables in `src/theme/`, then run `pnpm --filter astralis-ui gen:tokens`. Don't edit the generated CSS by hand. |
| **CSS coverage** | A component emits a class the precompiled stylesheet does not contain, so it would do nothing in the browser. | Use the style props or an existing token instead of a one-off class. |
| **Contrast** | A colour pairing the theme promises dropped below WCAG AA (4.5:1 for text, 3:1 for focus rings and control borders) in light or dark mode. | Pick a different step of the palette for that role in the token tables. |
| **Server boundary** | A component that must ship no client JavaScript now pulls in client code, or a module's `"use client"` directive was lost. | Move the interactive part into a small client component, or restore the directive. |
| **Exports** | A `package.json` entry point is missing, or its types disagree with its code. | Rebuild; if it persists, align the module with its declared types. |

CI runs the same build, the library tests and the docs build on every pull
request.

## Commits and branches

Write each commit message as one line, in the form `Area - What was done`:

```
Select - Escape closes only the listbox, not the surrounding dialog
Docs - Keyboard section for Splitter
CLI - add refuses block ids that could write outside the project
```

The area is the component, package or part of the site you changed. Keep one
concern per commit: a fix and an unrelated refactor are two commits, while a
small follow-up to the same change folds into it.

Name branches after the change: `fix/select-escape`, `feat/rating-half-stars`,
`docs/splitter-keyboard`.

## Pull requests

1. Branch from `main` and keep the change focused.
2. Add or update tests for behaviour you change.
3. Update the docs page and props table if the API changed.
4. Add a changelog line for anything users will notice.
5. Run the build and the tests for the packages you touched.
6. Open the pull request and fill in the template. Link the issue it closes.

Every pull request is reviewed before it is merged. Feedback is about the
code, never the person; if something is unclear, ask.

## Releases

Each package is versioned on its own. Under 0.x a minor version (0.8.0) may
contain breaking changes and a patch (0.8.1) never does; breaking changes are
listed at the top of the release notes with how to upgrade.

Every published version is tagged `package@version` (for example
`astralis-ui@0.8.0`) and has a [GitHub release](https://github.com/sekiro-9/astralis-ui/releases)
with its notes. The maintainer handles publishing.

## Code of conduct and license

Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md). By
contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
