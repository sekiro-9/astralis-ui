# astralis-devtools

A development overlay for [Astralis UI](https://astralis-zeta.vercel.app). A
button in the corner of your page opens three tabs:

- **Inspect.** Pick any Astralis component on the page and see its name, the
  props it was given, how it reaches the browser (Server Component, client
  island or Client Component) and a link to its documentation. This includes
  Server Components, which React DevTools cannot see because they never
  hydrate.
- **Findings.** The findings of `astralis validate` for your whole project,
  kept current as you save. On Next.js, the files that render the current page
  are listed first.
- **Report.** Send a problem to the Astralis maintainers as an issue snapshot:
  the components under the one you picked with their props, the versions in
  use and the validator's findings. You see the exact JSON first, page text is
  replaced by placeholders unless you include it, and nothing is sent until
  you press Send.

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

The overlay talks only to your own dev server. The one request that leaves your machine is a report you have read and sent, which the bridge forwards to the Astralis issue platform.

## License

MIT
