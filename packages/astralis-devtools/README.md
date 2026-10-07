# astralis-devtools

A development overlay for [Astralis UI](https://astralis-ui.com). A small
launcher, which you can drag anywhere on the page, opens a panel with five
screens:

- **Home.** What is on the page at a glance.
- **Components.** Every Astralis component on the page, grouped by kind. Each
  opens a page of its own: its name, the props it was given, how it reaches
  the browser (Server Component, client island or Client Component), where it
  sits, a link to its documentation, and the findings about it. This includes
  Server Components, which React DevTools cannot see because they never
  hydrate.
- **Findings.** What `astralis validate` says is broken in your project, kept
  current as you save. On Next.js, the files that render the current page are
  listed first.
- **Recommendations.** The validator's warnings: what works but could be
  better.
- **Report.** Open a problem as a GitHub issue on the Astralis repository,
  from your own account, with an issue snapshot: the components under the one
  you picked with their props, the versions in use, the validator's findings
  and a small reproduction. You see the exact JSON first, page text is
  replaced by placeholders unless you include it, and nothing is sent until
  you press Send. **Your issues** lists the issues you have opened and where
  each stands.

`Shift+Alt+A` opens and closes it. `Shift+Alt+C` picks a component on the page
and opens its page.

It runs in development only. Production builds contain none of it, and the
library's production HTML carries no DevTools attributes.

## Set up

```bash
npx astralis-cli init --devtools
```

New projects made with `npm create astralis` have it already. To wire it by hand:

**Next.js.** Add the component to the root layout:

```tsx
import { AstralisDevTools } from "astralis-devtools/next";

<body>
  {children}
  <AstralisDevTools />
</body>
```

Then add the bridge's route at `app/api/astralis-devtools/[...path]/route.ts`:

```ts
export { GET, POST } from "astralis-devtools/next/route";
```

**Vite.** Add the plugin:

```ts
import { astralisDevtools } from "astralis-devtools/vite";

export default defineConfig({ plugins: [react(), astralisDevtools()] });
```

## How it works

In development, every astralis-ui component names itself on the element it
renders (`data-astralis="Card.Body"`), together with the props it was
configured with. The overlay reads those attributes.

A small bridge runs inside your dev server. It validates your `.tsx` and
`.jsx` files against the installed astralis-ui's `system-spec.json` and
re-validates each file when you save it. It answers requests from your own
machine only. On Next.js it is the route above, and it returns 404 in
production. On Vite it is dev-server middleware that `vite build` never loads.

The overlay talks only to your own dev server. The bridge talks to GitHub only for you: to sign you in with a code (through the Astralis DevTools GitHub App, which can only read and write issues on the Astralis repository), to open a report you have read and sent, and, while you are signed in, to list your issues. The token is kept in a file in your user config directory that only you can read, never in the page, and `astralis report` shares it.

## License

MIT
