import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import * as Astralis from "./index";
import { AstralisProvider } from "./index";

/**
 * A DOM attribute given to a component must land on the element it renders
 * as its root: `id`, `data-*` and `aria-*` are how a consumer, a test, or a
 * visual tool addresses the thing it placed. A component that renders an
 * element of its own and drops them is broken for all three.
 *
 * Roots that render no element of their own (a Modal is a context, a Portal
 * is a relocation) are listed explicitly; everything else must comply.
 */

const PROBE = "data-probe";

/** Components whose root is a context or a relocation, not an element. */
const NO_ROOT_ELEMENT = new Set([
  "AlertDialog",
  "AlertDialogRoot",
  "ContextMenu",
  "Drawer",
  "HoverCard",
  "HoverCardRoot",
  "Menu",
  "Modal",
  "Popout",
  "PopoutRoot",
  "Popover",
  "Portal",
  "Toaster",
  "Tooltip",
  "AstralisProvider",
  // A pre-paint <script> for the document head, not an element anyone places.
  "ThemeScript",
]);

/** Parts that need a root, or a root and a sibling part, above them. */
const NESTING: Readonly<Record<string, readonly string[]>> = {
  Accordion: ["Item", "Trigger", "Content"],
  "Accordion.Trigger": ["Accordion", "Accordion.Item"],
  "Accordion.Content": ["Accordion", "Accordion.Item"],
  "Accordion.Item": ["Accordion"],
  "Breadcrumb.Item": ["Breadcrumb"],
  "Breadcrumb.Link": ["Breadcrumb"],
  "Calendar.Header": ["Calendar"],
  "Card.Header": ["Card"],
  "Card.Body": ["Card"],
  "Card.Footer": ["Card"],
  "Card.Title": ["Card"],
  "Card.Description": ["Card"],
  "Carousel.Track": ["Carousel"],
  "Carousel.Slide": ["Carousel"],
  "Carousel.Control": ["Carousel"],
  "Carousel.Prev": ["Carousel"],
  "Carousel.Next": ["Carousel"],
  "Carousel.Indicator": ["Carousel"],
  "Carousel.Indicators": ["Carousel"],
  "Carousel.ProgressText": ["Carousel"],
  "Carousel.AutoPlayTrigger": ["Carousel"],
  "CodeBlock.Header": ["CodeBlock"],
  "CodeBlock.Title": ["CodeBlock"],
  "CodeBlock.Control": ["CodeBlock"],
  "CodeBlock.Content": ["CodeBlock"],
  "CodeBlock.Code": ["CodeBlock"],
  "CodeBlock.WindowControls": ["CodeBlock"],
  "Collapsible.Trigger": ["Collapsible"],
  "Collapsible.Content": ["Collapsible"],
  "DataList.Item": ["DataList"],
  "DataList.Label": ["DataList"],
  "DataList.Value": ["DataList"],
  "Drawer.Header": ["Drawer"],
  "Drawer.Body": ["Drawer"],
  "Drawer.Footer": ["Drawer"],
  "Drawer.Title": ["Drawer"],
  "Drawer.Description": ["Drawer"],
  "Editable.Preview": ["Editable"],
  "Editable.Input": ["Editable"],
  "EmptyState.Indicator": ["EmptyState"],
  "EmptyState.Title": ["EmptyState"],
  "EmptyState.Description": ["EmptyState"],
  "EmptyState.Actions": ["EmptyState"],
  "Field.Label": ["Field"],
  "Field.HelpText": ["Field"],
  "Field.ErrorText": ["Field"],
  "FileUpload.Dropzone": ["FileUpload"],
  "FileUpload.Trigger": ["FileUpload"],
  "FileUpload.ItemGroup": ["FileUpload"],
  "List.Item": ["List"],
  "Marquee.Item": ["Marquee"],
  "Modal.Header": ["Modal"],
  "Modal.Body": ["Modal"],
  "Modal.Footer": ["Modal"],
  "Modal.Title": ["Modal"],
  "Modal.Description": ["Modal"],
  "Pagination.List": ["Pagination"],
  "Pagination.Item": ["Pagination"],
  "Pagination.Pages": ["Pagination"],
  "Pagination.Ellipsis": ["Pagination"],
  "Pagination.Prev": ["Pagination"],
  "Pagination.Next": ["Pagination"],
  "Pagination.First": ["Pagination"],
  "Pagination.Last": ["Pagination"],
  "Pagination.PageText": ["Pagination"],
  "Pagination.Jumper": ["Pagination"],
  "SegmentedControl.Item": ["SegmentedControl"],
  "Splitter.Panel": ["Splitter"],
  "Splitter.Handle": ["Splitter"],
  "Stat.Label": ["Stat"],
  "Stat.Value": ["Stat"],
  "Stat.HelpText": ["Stat"],
  "Stat.Indicator": ["Stat"],
  "Steps.List": ["Steps"],
  "Steps.Item": ["Steps"],
  "Steps.Indicator": ["Steps", "Steps.Item"],
  "Steps.Title": ["Steps", "Steps.Item"],
  "Steps.Description": ["Steps", "Steps.Item"],
  "Steps.Content": ["Steps"],
  "Steps.Completed": ["Steps"],
  "Steps.Prev": ["Steps"],
  "Steps.Next": ["Steps"],
  "Table.Header": ["Table"],
  "Table.Body": ["Table"],
  "Table.Footer": ["Table"],
  "Table.Row": ["Table", "Table.Body"],
  "Table.Head": ["Table", "Table.Header", "Table.Row"],
  "Table.Cell": ["Table", "Table.Body", "Table.Row"],
  "Table.Caption": ["Table"],
  "Tabs.List": ["Tabs"],
  "Tabs.Trigger": ["Tabs", "Tabs.List"],
  "Tabs.Content": ["Tabs"],
  "Timeline.Item": ["Timeline"],
  "Timeline.Indicator": ["Timeline", "Timeline.Item"],
  "Timeline.Content": ["Timeline", "Timeline.Item"],
  "Timeline.Title": ["Timeline", "Timeline.Item"],
  "Timeline.Description": ["Timeline", "Timeline.Item"],
  "Toolbar.Group": ["Toolbar"],
  "Toolbar.Separator": ["Toolbar"],
  "Modal.Trigger": ["Modal"],
  "Drawer.Trigger": ["Drawer"],
  "Popover.Trigger": ["Popover"],
  "Tooltip.Trigger": ["Tooltip"],
  "HoverCard.Trigger": ["HoverCard"],
  "HoverCardRoot.Trigger": ["HoverCardRoot"],
  "AlertDialog.Trigger": ["AlertDialog"],
  "AlertDialogRoot.Trigger": ["AlertDialogRoot"],
  "Menu.Trigger": ["Menu"],
  "ContextMenu.Trigger": ["ContextMenu"],
};

/** Parts that render nothing of their own in any state the probe can reach:
 *  a fragment of items, or a panel that waits for a state. Read by hand. */
const NO_REACHABLE_ELEMENT = new Set([
  "Pagination.Pages",
  "Carousel.Indicators",
  "Steps.Completed",
]);

/** Props a component cannot render without. */
const REQUIRED: Readonly<Record<string, Record<string, unknown>>> = {
  Image: { src: "/a.png", alt: "a" },
  Tabs: { defaultValue: "a" },
  "Tabs.Trigger": { value: "a" },
  "Tabs.Content": { value: "a" },
  "Accordion.Item": { value: "a" },
  "SegmentedControl.Item": { value: "a" },
  "Pagination.Item": { page: 1 },
  "Carousel.Indicator": { index: 0 },
  "Steps.Content": { index: 0 },
  CopyButton: { value: "x" },
  QrCode: { value: "x" },
  QrCodeRoot: { value: "x" },
  "Image.Group": { items: [] },
  "Tag.Group": { options: [] },
  "TagRoot.Group": { options: [] },
  TableOfContents: { items: [] },
};

/** Props a HOST needs for one part to render, that its other parts cannot
 *  take (an Editable in edit mode renders the Input and drops the Preview). */
const HOST_PROPS: Readonly<Record<string, Record<string, Record<string, unknown>>>> = {
  "Editable.Input": { Editable: { startWithEditView: true } },
};

type Renderable = Record<string, unknown>;

function resolve(name: string): ComponentType<Record<string, unknown>> | null {
  let current: unknown = Astralis as Renderable;
  for (const segment of name.split(".")) {
    if (typeof current !== "object" && typeof current !== "function") return null;
    if (current === null) return null;
    current = (current as Renderable)[segment];
  }
  return typeof current === "function" || (typeof current === "object" && current !== null)
    ? (current as ComponentType<Record<string, unknown>>)
    : null;
}

function wrap(name: string, inner: ReactNode): ReactNode {
  const hosts = NESTING[name] ?? [];
  return hosts.reduceRight<ReactNode>((child, host) => {
    const Host = resolve(host);
    const props = { ...(REQUIRED[host] ?? {}), ...(HOST_PROPS[name]?.[host] ?? {}) };
    return Host ? createElement(Host, props, child) : child;
  }, inner);
}

const roots = Object.keys(Astralis).filter(
  (name) => /^[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name) && resolve(name) !== null,
);
/** Flat exports that ARE a part (CardBody is Card.Body) are covered by the
 *  dotted name, rendered in its place. */
const partIdentities = new Set<unknown>(
  roots.flatMap((name) => {
    const root = resolve(name) as unknown as Renderable;
    return Object.keys(root)
      .filter((key) => /^[A-Z]/.test(key))
      .map((key) => root[key]);
  }),
);
/** Inside an overlay's content, which only renders open; checked by reading. */
const INSIDE_OVERLAY = /^(AlertDialog|AlertDialogRoot|Drawer|Modal|Popover|Tooltip|HoverCard|HoverCardRoot|Menu|ContextMenu).(Content|Header|Body|Footer|Title|Description|Close|CloseButton|Item|Label|Separator|Group)$/;
/** Renders nothing until state no prop can seed (a picked file); checked by
 *  reading. */
const NEEDS_STATE = new Set(["FileUpload.ItemGroup"]);
const cases = roots
  .filter((name) => !partIdentities.has(resolve(name)) || NESTING[name] !== undefined)
  .flatMap((name) => {
    const root = resolve(name) as unknown as Renderable;
    const parts = Object.keys(root).filter((key) => /^[A-Z]/.test(key));
    return [name, ...parts.map((part) => `${name}.${part}`)];
  })
  .filter((name) => !INSIDE_OVERLAY.test(name) && !NEEDS_STATE.has(name));

describe("a DOM attribute reaches the root element", () => {
  for (const name of cases) {
    const bare = name.split(".").pop() ?? name;
    if (NO_ROOT_ELEMENT.has(name) || NO_REACHABLE_ELEMENT.has(name) || bare === "Root") continue;

    it(name, () => {
      const Component = resolve(name);
      expect(Component).not.toBeNull();
      if (!Component) return;

      const props = { [PROBE]: "here", ...(REQUIRED[name] ?? {}) };
      const child = /Trigger$|Close$/.test(name) ? createElement("button", null, "x") : "x";
      const original = console.error;
      console.error = () => {};
      let html = "";
      try {
        // A void element rejects children; try without them before giving up.
        for (const element of [createElement(Component, props, child), createElement(Component, props)]) {
          try {
            html = renderToString(createElement(AstralisProvider, null, wrap(name, element)));
            break;
          } catch {
            html = "";
          }
        }
      } finally {
        console.error = original;
      }
      expect(html, `${name} dropped ${PROBE}`).toContain(`${PROBE}="here"`);
    });
  }
});
