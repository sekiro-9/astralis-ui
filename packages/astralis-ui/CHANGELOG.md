# Changelog

All notable changes to `astralis-ui`. Under 0.x, a minor version (0.8.0) may
contain breaking changes; a patch (0.8.1) never does.

Versions marked **internal** were set in the repository but never published to
npm. Their changes reached npm in the next published version, which says so.

## 0.8.0 (2026-10-01)

The first npm release since 0.7.1. It includes everything in the internal
versions 0.7.2 to 0.7.8 below: Server Components with zero client JavaScript,
container-query responsive props, contrast contracts, and twenty new
components. Read **Upgrading from 0.7.1** first.

### Upgrading from 0.7.1

- **`Spinner` is now `Loader`.** Rename the import; pass `variant="spinner"`
  to keep the old look (see below).
- **`Button` defaults to `type="button"`.** A Button inside a form no longer
  submits it unless you pass `type="submit"`.
- **`Text` and `Heading` inherit their colour** from the surrounding text
  instead of forcing the base label colour. Pass `color="base"` where you
  relied on the old default.
- **Checkbox, Radio, Switch and the selection cards style their label**, not
  the hidden input. Custom CSS that targeted the input's appearance should
  target the label.
- **Tabs** with neither `value` nor `defaultValue` activate their first
  trigger instead of showing no panel.
- From 0.7.2: **Table parts outside a `<Table>` no longer throw**, and
  **compound inheritance reaches direct children only** for Stat, Timeline
  items, AvatarGroup, ButtonGroup, InputGroup and CodeBlock.
- From 0.7.4: text on the orange, green, teal and cyan **solid fills is now
  black**, because white failed WCAG AA on them.

### Loader replaces Spinner, in five variants

`Spinner` is renamed `Loader`, since most of its variants no longer spin. A
`variant` prop picks the animation: `blocks` (the default, the Astralis mark
assembling itself), `spinner` (the arc `Spinner` drew), `dots`, `bars` and
`pulse`. Size, `colorScheme`, `label` and the placement props are unchanged,
and it is still a Server Component that ships no client JavaScript.

```tsx
<Loader variant="spinner" />
```

### Visitors can re-theme at run time, and keep their choice

`useTheme()` now returns `setTokens`, which re-themes everything under the
provider from a new seed, for example a brand picker. `setTokens(undefined)`
returns to the `tokens` prop.

With `persistTokens` on the provider, that choice is stored in localStorage
and restored on the next visit. Add `persistTokens` to `ThemeScript` too, and
the stored theme is applied before first paint, so a returning visitor never
sees the default brand first. The stored theme also sits on `:root`, so
overlays portalled out of the provider's container take it as well.

```tsx
<ThemeScript persistTokens />
<AstralisProvider persistTokens>{children}</AstralisProvider>
```

### ThemeScript, and no flash of the wrong theme

`ThemeScript` (and `getThemeScript` for other frameworks) applies the stored
light or dark choice before first paint. The provider's storage is guarded
against blocked storage and invalid values, and is only written when
`setTheme` is called. Seeds from shared links or storage are validated, and
font stacks that could inject CSS are dropped.

### Development builds name each component

Outside production, every component's root element carries
`data-astralis="Card.Body"` and `data-astralis-props`, a JSON array of the
props it was configured with (variant, size, style props; never children,
text, links, sources or handlers). When one component renders through another
onto the same element the names chain, outermost first:
`data-astralis="Modal.Trigger Button"`. Server Components are named too, since
the attributes are part of the server-rendered HTML. The Astralis DevTools
read them to find components on a page.

In production each component is exactly the function it was before, so the
HTML is unchanged. A test renders every component both ways and requires the
production HTML to equal the development HTML with these two attributes
removed. `QrCode`, `Steps`, `Tabs`, `Card` and `CodeBlock` now have their
public names as `displayName` (it was `Tabs.Root` and so on).

### Added

- **Spelt-out style props.** Every abbreviated style prop also answers to its
  CSS name: `padding="4"` is `p="4"`, `marginTop` is `mt`, `background` is
  `bg`, and so on for sizes, borders, corners, logical sizes and flex and grid
  items. `PROP_ALIASES` and `LONG_NAMES` list them.
- **Placement props** gain `position`, the inset offsets and `zIndex`.
- **`onValueChange`** on every value-holding control: Checkbox.Group,
  Radio.Group, NumberInput, PinInput, Rating, SegmentedControl, Editable,
  Select, Combobox, MultiSelect and Tag.Group.
- **`colorScheme`** on Input, NumberInput, PinInput, NativeSelect,
  SegmentedControl, Editable and Steps.
- **Select and MultiSelect** take the `underline` and `unstyled` variants, a
  `searchLabel`, and a real clear button.
- **Combobox** `allowCustomValue` keeps typed text that matches no option.
- **Tag**: uncontrolled `CheckableTag` and `Tag.Group`, and
  `onCheckedChange`.
- **Link** announces its external marker as opening in a new tab, with an
  overridable `externalLabel`.
- **Calendar** accepts `null` as a controlled value.
- `useFieldContext`, so custom controls can join a `Field`.
- Search inputs drop the browser's own clear button, a blue X in Chromium
  that ignored the theme.

### Accessibility

- Focus rings clear 3:1 contrast in every colour scheme, and form boundaries
  use a new `stroke-control` role that does the same.
- Field publishes the label's id to its control, and every Field-aware
  control reads `disabled`, `invalid` and `required` from it.
- Select, Combobox and MultiSelect use active-descendant wiring, accept
  spaces in their search input, and their listbox joins the overlay stack,
  so Escape closes only the list inside a dialog.
- Slider drags with pointer capture (touch works), and has accessible names,
  value text and a form input.
- Toast pauses while focused, announces through persistent live regions, and
  Escape dismisses only the focused toast.
- Calendar uses ARIA grid semantics with the locale's day names and skips
  disabled days.
- The Image lightbox is a modal dialog with labelled controls; ImageGroup's
  thumbnails are keyboard buttons.
- Progress puts its accessible name on the progressbar; Steps announces
  completed and error states; Tabs names a scrolling tablist; ScrollArea's
  region is keyboard focusable.
- Button marks loading with `aria-busy`, and warns once in development when
  an icon-only Button has no accessible name. Input's password toggle is
  reachable by keyboard.
- Menu opens on its last item with ArrowUp.

### Fixed

- **Overlays**: dismissal and focus trapping run once per open and ignore
  presses inside higher layers; Modal, Drawer and AlertDialog share one dialog
  core whose parts forward style, refs and DOM props; triggers keep the
  wrapped element's ref and compose its handlers; Tooltip and HoverCard close
  through the overlay stack.
- **DOM attributes reach the root element** across the library: `id`,
  `data-*` and `aria-*` given to Accordion, Avatar, Carousel, DataList,
  Pagination, Stat, Steps, Tabs, Timeline, Toolbar, the data-entry wrappers,
  QrCode, ImageGroup, TableOfContents and every overlay Trigger and Close slot
  now land on the element they render.
- **AstralisProvider** toggles `astralis-dark` on the document it renders
  into, so a provider in an iframe themes that frame.
- **Image** forwards `id`, `data-*` and `aria-*` to its outermost element and
  notices an image that loaded before React attached its listener.
- **Avatar** retries the image when `src` changes.
- **NumberInput** fires only when a commit changes the value, and steps
  without floating-point drift.
- **Carousel** autoplay survives hover; **Accordion** and **Pagination** are
  controllable, and Pagination clamps an out-of-range page.
- **Tabs** builds trigger and panel ids that survive free-text values.
- Picker menus flip above their anchor when there is no room below.
- **QrCode** encodes in-house and renders its SVG synchronously, with no
  runtime style injection; the `qrcode` dependency is gone.

### Packaging

- The subpath type declarations are generated from source and gated against
  the modules they describe; `dist` is cleaned before each build; tests run
  before publish; `package.json` is exported; `engines` is declared.
- The stylesheet compiles the `@theme` mapping inline, dropping 382
  self-referential declarations.

### Spec

`system-spec.json` moves to `specVersion` 3. It now records every export,
each component's required props and what it does with its children
(measured, not authored), part exports, fuller anatomy, whether a DOM
attribute reaches an element of the component's own, and the group props a
component omits or redefines. `astralis validate` and the MCP server use all
of it.

## 0.7.8 (2026-08-27, internal)

Medium tier, batch two. A fourth candidate, Lightbox, was built and then
removed the same day: `ImageGroup` already ships a gallery lightbox
(thumbnails, previous and next, Escape, zoom), and `Image` `preview` covers
the single image.

### Added

- **FileUpload** (with Dropzone, Trigger and ItemGroup): picking and
  drag-and-drop around a hidden native file input, so the picker, `accept`
  filtering and mobile flows stay the platform's. `maxSize` and `maxFiles`
  violations are reported through `onReject`, never silently truncated.
- **Splitter** (with Panel and Handle): a two-panel resizable split. The
  handle is a real `role="separator"` with the APG window-splitter keyboard
  contract (arrows step, Home and End jump) and pointer-capture dragging.
- **TableOfContents**: on-this-page navigation with scroll-spy. Entries are
  plain anchor links, so navigation works before hydration and without
  JavaScript; the highlight is the enhancement.

Component count: 80 to 83.

## 0.7.7 (2026-08-26, internal)

Medium tier, batch one: five components on the existing overlay and focus
machinery, with no new foundational code.

### Added

- **ContextMenu**: Menu opened by right-click, anchored at the pointer. The
  parts are Menu's parts; only the trigger differs.
- **HoverCard** (with Trigger and Content): a rich preview on hover intent,
  with an open delay and a close grace period so the pointer can travel into
  the card. Focus opens it immediately for keyboard users.
- **Toolbar** (with Group and Separator): `role="toolbar"` on the APG
  pattern, where arrows move focus across the controls and Home and End jump.
- **ScrollArea**: themed scrollbars that are the platform's own, restyled
  with CSS. No JavaScript thumb, and zero client JavaScript.
- **Editable** (with Preview and Input): click-to-edit text. Enter or blur
  commits, Escape cancels.

Component count: 75 to 80.

## 0.7.6 (2026-08-25, internal)

Ten components from the audited low-effort tier of the component roadmap.
Each was first checked against what already ships under another name (Switch
covers Toggle, Button's `isIconOnly` covers IconButton, and so on), so nothing
here duplicates.

### Added

- **SegmentedControl** (with Item): a single-choice view switcher on native
  radios, so arrow keys, form participation and radio semantics come from the
  platform.
- **Rating**: a star input on native radios. `readOnly` renders a static
  display where fractional values show half stars.
- **NativeSelect**: a styled native `<select>` wearing Input's outline and
  filled looks, and Field-aware.
- **CheckboxCard** and **RadioCard**: card-shaped selection controls that join
  `Checkbox.Group` and `Radio.Group` like their small siblings.
- **AlertDialog**: Modal with forced-choice semantics: `role="alertdialog"`,
  no overlay click to close by default, no corner X.
- **CopyButton**: a Button that copies `value` to the clipboard, with a
  transient copied state.
- **EmptyState** (with Indicator, Title, Description and Actions): a
  blank-slate compound with zero client JavaScript.
- **Backdrop**: the Modal and Drawer scrim as a standalone primitive.
- **VisuallyHidden**: content for screen readers only, the companion for
  icon-only controls.

Component count: 65 to 75.

## 0.7.5 (2026-08-25, internal)

Two components that stay interactive with JavaScript disabled: the platform
owns the state, and Astralis ships the markup and CSS. Both are Server
Components, and a build gate keeps them that way.

### Added

- **Collapsible**: a single disclosure on native `<details>` and `<summary>`.
  `name` groups siblings into a native exclusive accordion.
- **Popout**: an anchored panel on the native `popover` attribute, positioned
  by CSS anchor positioning. The top layer, Escape, light dismiss, focus
  return and flipping all come from the platform. It is a disclosure, not a
  menu; Menu remains the stateful sibling.
- **Textarea `autoGrow`**: grows with its content through native
  `field-sizing: content`, with no JavaScript.

Component count: 63 to 65.

## 0.7.4 (2026-08-24, internal)

The theme's readable-text promises (labels on surfaces, contrast text on solid
fills, a hue's label on its subtle) are now contracts the build checks, and
`astralis theme` checks them against the palette a seed actually generates.

### Fixed

- White text on the orange, green, teal and cyan solid fills measured 3.3 to
  3.7:1, below AA. Text on a solid now uses whichever of black or white wins
  the WCAG ratio, so those fills take black text, and every seeded brand gets
  a correct answer too.

### Added

- The `astralis-ui/contrast` subpath: `contrastRatio`, `contrastContracts`,
  `verifyContrast`, `verifySeedContrast` and `parsePaletteFromCss`. WCAG 2.x,
  with no dependencies and safe on the server.
- A build gate: 76 promised pairings must clear AA in both modes.
- `system-spec.json` gains a `contrast` section with each pairing's verified
  ratio.

## 0.7.3 (2026-08-23, internal)

Container-query responsive props. Every responsive key gains an `@` twin
(`@sm`, `@md`, `@lg`, `@xl`) that resolves against the nearest ancestor marked
`container` instead of the viewport. Same names, same widths:

```tsx
<Box container>
  <Card size={{ base: "sm", "@md": "lg" }} /> {/* lg when the Box is 48rem or wider */}
</Box>
```

- Works on every responsive prop, and viewport and container keys mix in one
  map.
- `container` on any Box-composing primitive renders
  `container-type: inline-size`. Without a container ancestor, `@` values
  never apply.
- Still zero-runtime and server-safe.
- `system-spec.json` gains `containerBreakpoints`.
- The stylesheet grows to 457 kB raw and 53 kB gzip (from 290 and 33) to carry
  the container variants.

## 0.7.2 (2026-08-20, internal)

Server-first. The static half of the library renders as true React Server
Components and ships zero client JavaScript, enforced by a build gate,
recorded per component in `system-spec.json` (`client: "none" | "leaf" |
"required"`) and shown on every docs page. On an identical benchmark page,
Astralis ships 15 kB gzip of library JavaScript beyond the framework, against
36 kB for shadcn/ui, 58 kB for MUI and 95 kB for Chakra v3.

### Fixed

- Compound dot access (`Card.Body`, `Table.Head`, `Stat.Label`) no longer
  resolves to `undefined` inside Server Components.
- Children passed from a Server Component into client compounds (a `<Button>`
  inside `<Menu.Trigger>`, items inside `<Steps>` or `<Carousel>`) hydrate
  correctly.
- `AvatarBadge` sizes to its own avatar instead of the group default.

### Changed

- **Table parts outside a `<Table>` no longer throw.** They render with `md`
  defaults, the quiet fallback Card has always had.
- **Compound inheritance reaches direct children only** for Stat, Timeline
  items, AvatarGroup, ButtonGroup, InputGroup and CodeBlock. A wrapper element
  between the root and a part means the part uses its defaults. Card, Table,
  Timeline and DataList styling still reaches any depth.
- `Button` takes `ref` as a regular prop (React 19) instead of `forwardRef`.

### Added

- `system-spec.json` records each component's `client` tier and its own
  closed vocabularies (Button `variant`, Alert `status`), so `astralis
  validate` and the MCP `validate_code` tool reject invalid values with
  suggestions.

## 0.7.1 (2026-08-16)

- Arbitrary values on every style prop: strings that are not tokens ride the
  same CSS-variable channel, so `w="352px"`, `bg="oklch(0.7 0.1 250)"` and
  `p="calc(100% - 2rem)"` work, still zero-runtime and still responsive. Bare
  numbers warn, since they are not valid CSS lengths.
- Style-prop types widen to `Token | (string & {})`: autocomplete offers the
  tokens first, and any string typechecks.

## 0.7.0 (2026-08-13)

The var-channel. Style props stop generating one CSS class per value; each
prop has one fixed class per breakpoint, and the value travels in a CSS
custom property.

- The stylesheet drops from 1,283 kB to 290 kB raw (from 142 kB to 33 kB
  gzip), and no longer needs a safelist for responsive values.
- Selectors drop from 17,706 to 3,012, and the CSS build from 11 s to 0.5 s.
- `hover`, `focusVisible` and `active` work on all 51 value props.
- A coverage gate proves every token resolves to a compiled class before the
  build can publish.

## 0.6.0 (2026-08-11)

### Breaking

- **`Flex`, `Stack` and `VStack` no longer default `alignItems` to `start`.**
  Children stretch on the cross axis exactly as in plain CSS. `HStack` keeps
  its deliberate `center`.

### Added

- `Stack`'s `direction` is responsive, so "stacked on mobile, a row on
  desktop" is one prop.
- `Stat` takes a responsive `size` (`sm` to `xl`) that scales its label,
  value, help text and indicator together, and an `align` prop.
- The scales gain the values layout code reaches for: `"0"` on every sizing,
  spacing and gap prop, and `"auto"` on the margins (`ml="auto"`,
  `mx="auto"`).
- `Badge` and `Tag` document the split between them: a Badge is a state the
  thing is in, a Tag is a label it carries.

## 0.5.0 (2026-08-10)

### Breaking

- **`Container` no longer accepts `size`.** It fell through to Box's `size`,
  which set the height as well as the width. Use `maxW`.
- **The redundant `...Root` exports are removed**: `CardRoot`,
  `BreadcrumbRoot`, `CodeBlockRoot`, `FieldRoot` and `ImageRoot`. They were
  the same value as the compound; use `Card`, `Breadcrumb` and so on.
- **`Icon` no longer accepts SVG's `order` attribute**, so the flex-item
  `order` placement prop can take the name.

### Added

- **Placement props on every component that can be a child**: the sizes
  (`w`, `minW`, `maxW`, `h`, `minH`, `maxH`), the flex item props (`flex`,
  `basis`, `grow`, `shrink`, `order`, `alignSelf`) and the margins. A
  component owns how it looks; its parent owns where it sits and how big it
  is. Paint props stay off recipe components, and overlays are excluded,
  since nothing lays them out.
- `Select` passes its trigger's button props through, so an `aria-label`
  reaches the combobox.

### Fixed

- Type errors now fail the library build.

## 0.4.0 (2026-08-04)

### Added

- `COLOR_SCHEMES`, `accentClass` and the `ColorScheme` type, from the root
  and from a new `astralis-ui/color-schemes` subpath that is safe in Server
  Components and build scripts.
- `BOX_STYLE_TOKENS`, `FLEX_STYLE_TOKENS` and `GRID_STYLE_TOKENS`: the values
  each style prop accepts, for building pickers.

### Changed

- Light mode's `stroke-subtle` moves from gray-100 to gray-200. Subtle
  borders were about 1.1:1 on white and read as no border at all.

## 0.3.0 (2026-08-01)

### Breaking

- **The colour tokens are rebuilt around three ladders.** `surface-panel`
  becomes `surface-raised`; `surface-emphasized` and `stroke-emphasized` are
  removed; the strokes order as `subtle < base < muted`. The
  `surface-`, `label-` and `stroke-` status tokens (`surface-error` and so
  on) are removed: status colours come from their palettes
  (`error-subtle`, `error-label`, `error-stroke`), which also makes a seeded
  `errorColor` reach the UI.

### Added

- `hover`, `focusVisible` and `active` style props, precompiled like
  breakpoints, on every Box-composing primitive.
- Self-placement props on `Box`: `basis`, `flex`, `grow`, `shrink`, `order`
  and `alignSelf`.
- Per-side border widths: `borderT`, `borderR`, `borderB` and `borderL`.
- `Link` takes Text's typography props, each responsive.
- A horizontal `Tabs` row scrolls inside itself, with scroll buttons when
  there is more to reach, instead of widening the page.
- Breadcrumb, Link and Kbd follow the standard component layout, with flat
  exports.

### Fixed

- An explicit `display` no longer loses to Flex's and Grid's own display
  class, which left responsively hidden layouts visible at every width.
- `Link`'s `color` reached the DOM as a legacy attribute and did nothing.
- The tab strip no longer scrolls the whole page to itself on mount.
- `label-subtle` clears WCAG AA on its page in both modes.

## 0.2.1 (2026-07-24)

### Fixed

- The stylesheet's base reset applies only inside `.astralis`, so adding
  Astralis no longer restyles the rest of a host app. Portalled overlays
  re-apply the scope, so they keep the reset and the theme's fonts and
  colours.

## 0.2.0 (2026-07-23)

### Added

- **ThemeSeed.** A theme is one seed (brand, neutral and status colours,
  fonts, radius and type scales) passed as `tokens` to `AstralisProvider`.
  The semantic tokens and the status palettes are generated from it.
- `themeCss`, `parseThemeSeed`, `parseThemeCss`, `validateSeed` and
  `isEmptySeed`, also from a React-free `astralis-ui/serialize` subpath, to
  turn a seed into a static stylesheet and back.
- `generateThemeTokens`, beside `generateBrandShades` and
  `generateBrandTokens`.
- **FloatingButton**: a floating action button that rests in a corner and
  can be dragged, or moved with the keyboard, to anywhere on the screen.

### Changed

- The `astralis-ui/color-math` subpath is renamed `astralis-ui/theme-math`.

## 0.1.3 (2026-07-16)

### Added

- The `astralis-ui/color-math` subpath: the brand ramp generator without
  React, for `astralis theme` and build scripts.

## 0.1.2 (2026-07-14)

### Breaking

- **`CodeBlock` is a compound component**: `CodeBlock.Root`, `.Header`,
  `.Title`, `.Control`, `.WindowControls`, `.CopyTrigger`, `.Content` and
  `.Code`, so the header, copy button and body can be arranged and styled
  separately. The single-component props are gone.

## 0.1.1 (2026-07-13)

### Fixed

- Closing the top overlay of a stack unlocks page scrolling correctly, and
  the scroll lock is reference-counted.
- Portals mount in the same commit as their trigger, so anchored content
  (Popover, Menu) is positioned on its first open.

## 0.1.0 (2026-07-12)

The first release: about sixty accessible React 19 components on semantic
design tokens, with precompiled CSS and no Tailwind setup in the consuming
app.

- **Layout**: Box, Flex, Grid, Stack, Container, Center, Float, AspectRatio,
  Separator.
- **Typography**: Text, Heading, Link, List, Code, CodeBlock, Blockquote,
  Highlight, Kbd, Icon.
- **Buttons**: Button, ButtonGroup, ThemeToggle.
- **Data entry**: Field, Input, Textarea, NumberInput, PinInput, Select,
  MultiSelect, Combobox, Checkbox, Radio, Switch, Slider.
- **Data display**: Avatar, Badge, Tag, Card, Table, DataList, Stat,
  Timeline, Image, Marquee, QrCode, Calendar.
- **Feedback**: Alert, Progress, Skeleton, Spinner, Toast.
- **Overlay**: Modal, Drawer, Popover, Tooltip, Menu.
- **Navigation and disclosure**: Tabs, Steps, Breadcrumb, Accordion,
  Carousel, Pagination.

Also: `AstralisProvider` with light and dark modes and a `brandColor` that
generates perceptual OKLCH brand ramps; responsive style props on the
layout and typography primitives; `colorScheme` through an accent channel;
keyboard support on the WAI-ARIA patterns; React 19 `ref` as a prop; and an
ESM-only build with per-module `"use client"` boundaries.
