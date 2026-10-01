# Astralis UI

React 19 component library built on semantic design tokens: precompiled CSS,
runtime brand theming, first-class dark mode and responsive style props.
**83 components across 11 categories.**

**Docs & live demos:** https://astralis-ui.com

## Why Astralis

- **Zero build step.** The library ships one precompiled stylesheet. Your app
  runs no plugins, preprocessors or theme compiler. Internals are prefixed
  (`astralis:*`), so it sits beside whatever styling setup you already have.
- **Runtime theming.** Hand the provider a single brand colour and the full
  shade scale, hover states and a readable contrast colour are derived at
  runtime with OKLCH colour math:

  ```tsx
  <AstralisProvider tokens={{ brandColor: "#8b5cf6" }}>
  ```

- **One accent channel, fifteen colour schemes.** Every themeable component
  takes a `colorScheme` prop (ten hues plus `brand`, `error`, `warning`,
  `success` and `info`), backed by CSS-variable indirection, so any component
  recolours to any palette without per-hue CSS.
- **Responsive style props.** Layout and typography props accept breakpoint
  maps: `p={{ base: "4", md: "8" }}`. Value props (spacing, sizing, colour,
  radius, shadow) ride a CSS-variable channel: one fixed rule per prop and
  breakpoint reads a variable set on the element, so any token, or an
  arbitrary value like `w="calc(100% - 2rem)"`, works without a class having
  to exist for it. Keyword props (`display`, alignment, wrapping) resolve to
  precompiled classes.
- **Verified CSS.** Build gates assert that every class a component can emit
  exists in the shipped stylesheet, that the palette keeps its WCAG contrast
  promises (text 4.5:1, focus rings and control borders 3:1), and that the
  generated token files match their sources.
- **Light dependencies.** Three small runtime dependencies (`class-variance-authority`,
  `clsx`, `tailwind-merge`); no Radix, no Floating UI, no animation library.
  Behaviour lives in seven small in-house hooks.

## Install

```bash
pnpm add astralis-ui   # or npm / yarn
```

Requires React 19.

## Setup

```tsx
import { AstralisProvider } from "astralis-ui";
import "astralis-ui/styles.css"; // once, at your entry point

export function App({ children }) {
  return <AstralisProvider defaultTheme="system">{children}</AstralisProvider>;
}
```

With server rendering, add `ThemeScript` to `<head>` so a dark-mode visitor
never sees a flash of the light theme. Give it the same `storageKey` and
`defaultTheme` as the provider:

```tsx
import { ThemeScript } from "astralis-ui";

<html lang="en" suppressHydrationWarning>
  <head>
    <ThemeScript defaultTheme="system" />
  </head>
  <body>…</body>
</html>;
```

`getThemeScript()` returns the same script as a string for frameworks that
inject raw HTML.

## Use

```tsx
import { Button, Card, Field, Input, VStack } from "astralis-ui";

<Card>
  <Card.Header>
    <Card.Title>Create account</Card.Title>
  </Card.Header>
  <Card.Body>
    <VStack gap="4" alignItems="stretch">
      <Field required>
        <Field.Label>Email</Field.Label>
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <Button colorScheme="blue" fullWidth>Sign up</Button>
    </VStack>
  </Card.Body>
</Card>;
```

- [Installation guide](https://astralis-ui.com/docs/installation)
- [Quick start](https://astralis-ui.com/docs/quick-start)
- [Theming](https://astralis-ui.com/docs/theming)
- [All 83 components](https://astralis-ui.com/docs)

## Entry points

| Import | What it is |
| --- | --- |
| `astralis-ui` | Components, hooks-backed primitives, the provider and theme helpers |
| `astralis-ui/styles.css` | The precompiled stylesheet |
| `astralis-ui/theme-math` | React-free colour and seed maths (Node-safe) |
| `astralis-ui/serialize` | Seed validation and seed-to-CSS serialisation |
| `astralis-ui/contrast` | The WCAG contrast contracts and checkers |
| `astralis-ui/color-schemes` | The `colorScheme` list, readable on the server |
| `astralis-ui/system-spec.json` | The machine-readable design-system spec `astralis validate` checks against |

## For AI agents

The docs are machine-readable: [`/llms.txt`](https://astralis-ui.com/llms.txt)
indexes every page, and each page is available as plain markdown (e.g.
[`/docs/components/button.md`](https://astralis-ui.com/docs/components/button.md))
with full demo source included.

## License

MIT © Paul Andrew
