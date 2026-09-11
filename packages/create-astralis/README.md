# create-astralis

Start a new [Astralis UI](https://astralis-zeta.vercel.app) project:

```bash
npm create astralis my-app
pnpm create astralis my-app
yarn create astralis my-app
```

It runs the official `create-next-app` or `create-vite` prompts, then wires
Astralis into the result: the stylesheet imported, `<AstralisProvider>`
mounted, and a welcome page you can delete. The project is installed with the
package manager you ran it with.

This package is only the doorway: it runs `astralis create` from
[astralis-cli](https://www.npmjs.com/package/astralis-cli), and every option
passes straight through.

```bash
npm create astralis my-app -- --framework vite --template react
npm create astralis my-app -- --framework next --yes    # no prompts
npm create astralis -- --help
```

Needs Node `^22.18` or `>=24.11`. Full guide:
<https://astralis-zeta.vercel.app/docs/cli>.

## License

MIT
