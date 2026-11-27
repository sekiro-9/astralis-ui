# Changelog

All notable changes to `astralis-devtools`.

## 0.3.1 (2026-11-27)

The repository moved to github.com/paulandy789/astralis-ui (the GitHub account was renamed). Reports go to that repository by name, no longer through a redirect, and the package's links point there. Uses astralis-cli 0.8.1.

## 0.3.0 (2026-11-23)

Uses astralis-cli 0.8.0, so findings include `unknown-prop` and `unknown-state-prop` (astralis-ui 0.11.0).

### Changed

- **A new page starts with the panel folded.** Reloading, or navigating to another page, minimises it to the launcher and ends picking. Reopening it returns to the same screen. A new query or hash, and a hot reload, leave it open.
- **Creating an issue clears the form** and opens Your issues, with a confirmation that links to it. The list is refreshed, and shows the new issue even while GitHub's own list catches up.
- **The Report buttons say what they do:** Create issue from here, and Open GitHub's form instead.
- An unsent report's words are kept when the page changes or reloads, for the browser tab.

### Fixed

- A report cannot be sent twice, and the last words typed before sending are included.

## 0.2.0 (2026-11-21)

Uses astralis-cli 0.6.0 and reads the prop descriptions astralis-ui 0.10.0 puts in its system spec.

### Added

- **Every prop a component takes, on its page.** Under the props it was
  given, the component's page now lists every prop the installed system spec
  says it accepts: its own props first, then its style props by group (Box,
  Placement, Text…). Each shows the values it takes (a long scale shows its
  first few and opens to the rest), whether it is required, its description
  and default where the spec has them, and the value this instance uses. A
  search finds a prop by name, long spelling (`padding` finds `p`) or value.
  Groups other than the first open when asked for. On a trigger wrapping a
  Button, both can be listed.
- **Minimize.** The panel's header has a minimize button that folds it down
  to the launcher, leaving the page free to click. The launcher's mark,
  `Shift+Alt+A` or Escape from inside the panel do the same, and bringing it
  back returns to the screen it was on. Whether it is open stays for the
  browser tab's session, as before.

### Changed

- `Shift+Alt+A` brings the panel back on the screen it was minimized on,
  instead of on Home.
- After a report is sent, a confirmation shows **Open the issue on GitHub**
  and says how to add a screenshot or a file there. No tab opens by itself.

### Removed

- **The Report screen's screenshot.** Capturing the tab could include the
  open panel itself, and GitHub's API cannot attach images anyway. Pictures
  and files are added on GitHub, in the issue. The snapshot DevTools builds
  no longer carries a `screenshot` field; the snapshot format still accepts
  one, so snapshots filed before and `astralis report` are unchanged.

## 0.1.0 (2026-11-19)

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
