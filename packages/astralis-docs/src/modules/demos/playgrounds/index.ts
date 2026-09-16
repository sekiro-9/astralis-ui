import { deriveControls } from "@/lib/playground/controls";
import type { PlaygroundEntry } from "./define";
import { buttonPlaygrounds } from "./buttons";
import { dataDisplayPlaygrounds } from "./data-display";
import { dataEntryPlaygrounds } from "./data-entry";
import { disclosurePlaygrounds } from "./disclosure";
import { feedbackPlaygrounds } from "./feedback";
import { layoutPlaygrounds } from "./layout";
import { navigationPlaygrounds } from "./navigation";
import { overlayPlaygrounds } from "./overlay";
import { typographyPlaygrounds } from "./typography";

export type { PlaygroundEntry, PlaygroundFixture } from "./define";

/**
 * Components with a live Playground tab, one registry file per category.
 *
 * Keyed by the demo name used in `<ComponentPreview name="…" />`, so the tab
 * attaches itself to the *primary* demo on a page and appears once, at the top,
 * rather than beside every example.
 *
 * Deliberately NOT a "use client" module. ComponentPreview is a Server
 * Component and calls `hasPlayground` to decide whether to render the tab at
 * all; behind a client boundary that function would arrive as a client
 * reference and throw. The components it holds are themselves client
 * components. Referencing them from here is fine: React passes them across
 * the boundary and PlaygroundView (which is "use client") does the rendering.
 */
export const playgrounds = {
  ...typographyPlaygrounds,
  ...buttonPlaygrounds,
  ...dataDisplayPlaygrounds,
  ...dataEntryPlaygrounds,
  ...layoutPlaygrounds,
  ...overlayPlaygrounds,
  ...feedbackPlaygrounds,
  ...disclosurePlaygrounds,
  ...navigationPlaygrounds,
};

export type PlaygroundName = keyof typeof playgrounds;

/**
 * Component pages with no Playground tab, and why. Every other component page
 * registers its primary demo above, and the registry test holds both lists to
 * the pages that exist.
 *
 * The rule: a playground edits the root element's props against a fixed
 * fixture, on a bounded canvas. A component is left out only when that model
 * can't show it honestly: it has no element to configure, nothing visible to
 * configure, or it positions itself outside the canvas.
 */
export const withoutPlayground: Readonly<Record<string, string>> = {
  "floating-button": "It is fixed to the viewport, so it would float over the docs page, not the canvas.",
  popout: "Its root takes no props; the panel is configured on Popout.Content.",
  portal: "It has no appearance of its own; it only moves its children in the DOM.",
  toast: "Toasts are fired with toast(), not rendered as an element with props.",
  "visually-hidden": "It renders nothing visible and adds no props to its span.",
};

/**
 * True when this demo has a playground worth showing.
 *
 * Registration alone isn't enough: control derivation skips rows it can't read
 * honestly: `ReactNode`, handler signatures, and the grouped rows some props
 * tables use (`p · px · py`, `alignItems · justifyContent · wrap …`) that name
 * several props at once. A component whose rows are all of that kind would get
 * a tab over an empty rail, which reads as broken rather than as absent. So the
 * tab is gated on there being at least one real control.
 */
export const hasPlayground = (name: string): name is PlaygroundName => {
  if (!Object.hasOwn(playgrounds, name)) return false;
  const entry: PlaygroundEntry = playgrounds[name as PlaygroundName];
  // Style props count: the layout primitives derive almost nothing from their
  // tables and would otherwise be judged empty.
  return deriveControls(entry.rows).length > 0 || (entry.styleProps?.length ?? 0) > 0;
};
