# Changelog

All notable changes to `astralis-devtools`.

## 0.1.0 (2026-10-01)

The first release: a development overlay for Astralis UI. A launcher you can
drag anywhere on the page opens a panel with five screens.

- **Home.** The components on the page, the findings and the recommendations,
  at a glance.
- **Components.** Every Astralis component on the page, grouped by kind. Each
  opens a page of its own with its name, the props it was given, how it
  reaches the browser (Server Component, client island or Client Component),
  where it sits, a link to its docs, and the findings about it. Server
  Components are included.
- **Findings** and **Recommendations.** The errors and the warnings of
  `astralis validate` for the project, kept current as you save. On Next.js,
  the files that render the current page are listed first.
- **Report.** Open a problem as a GitHub issue from your own account, with an
  issue snapshot of the picked component and a reproduction. You see the
  exact JSON first, page text is replaced by placeholders unless you include
  it, and nothing is sent until you press Send. Sign-in is a code entered on
  github.com; the token stays with the dev server. A likely duplicate is shown
  before you send, and your report can be added to it instead. **Open on
  GitHub instead** fills in GitHub's own form, with no sign-in. **Your issues**
  lists the issues you have opened and where each stands.

`Shift+Alt+A` opens and closes it, and `Shift+Alt+C` picks a component on the
page. It wears the Astralis brand, with its fonts embedded, and needs no
network.

Set it up with `npx astralis-cli init --devtools`. It runs in development
only; production builds contain none of it. Requires astralis-ui 0.8.0 or
later, whose development builds name each component on the page.
