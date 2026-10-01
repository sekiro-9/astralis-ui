# Changelog

All notable changes to `astralis-devtools`.

## 0.1.0 (2026-10-01)

The first release: a development overlay for Astralis UI, with three tabs.

- **Inspect.** Pick any Astralis component on the page to see its name, the
  props it was given, how it reaches the browser (Server Component, client
  island or Client Component) and a link to its docs. Server Components are
  included.
- **Findings.** The findings of `astralis validate` for the project, kept
  current as you save. On Next.js, the files that render the current page are
  listed first.
- **Report.** Send a problem to the maintainers as an issue snapshot of the
  picked component. You see the exact JSON first, page text is replaced by
  placeholders unless you include it, and nothing is sent until you press
  Send.

Set it up with `npx astralis-cli init --devtools`. It runs in development
only; production builds contain none of it. Requires astralis-ui 0.8.0 or
later, whose development builds name each component on the page.
