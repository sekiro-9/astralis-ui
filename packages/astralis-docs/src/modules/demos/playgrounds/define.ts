import { Children, Fragment, isValidElement, type ComponentType, type ReactNode } from "react";
import * as ui from "astralis-ui";
import type { PropRow } from "@/modules/docs/props-table";
import { namesFromModule, toJsx, type JsxSource, type NameOf } from "@/lib/playground/jsx-source";

/**
 * Fixed element children for a component that is composed, not labelled:
 * `Alert.Title`, a `ButtonGroup` of `Button`s, an `Accordion.Item`.
 *
 * The playground edits the ROOT's props against this fixture; it does not edit
 * structure. That boundary is deliberate: a node-tree editor is a different
 * product, and this one stays finishable by not becoming it.
 *
 * Only `node` is authored. `source` (written into the generated code) and
 * `imports` are serialized from it, so the code beside the stage can't drift
 * from what the stage renders.
 */
export interface PlaygroundFixture {
  node: ReactNode;
  source: string;
  /** Names the source needs beyond the root tag, e.g. `Button` inside a group. */
  imports?: readonly string[];
}

export interface PlaygroundEntry {
  /** JSX tag name written into the generated code. */
  tag: string;
  component: ComponentType<Record<string, unknown>>;
  /** The documented props: the same data the props table renders. */
  rows: readonly PropRow[];
  /** Editable text children. Omit for components that take none. */
  children?: string;
  /** Label for the children input. */
  childrenLabel?: string;
  /** Fixed element children. Mutually exclusive with `children`. */
  fixture?: PlaygroundFixture;
  /**
   * Props the component needs to be meaningful, but which aren't worth a
   * control, usually because they're bound to the fixture. `Tabs` selects via
   * `useState(defaultValue)`, so without one nothing is selected and the panel
   * renders empty; but its value has to match a trigger in the fixture, so
   * letting the reader edit it would only break the example.
   *
   * Merged UNDER control state, and emitted in the generated code, because the
   * pasted snippet needs them to work.
   *
   * Not restricted to PropValue: Select and friends are configured by an
   * `options` array, which codegen serializes to a JS literal.
   */
  baseProps?: Record<string, unknown>;
  /**
   * Style props to offer, on top of anything the props table documents. The
   * layout primitives need this: their tables group whole families into one
   * row (`p · px · py · pt/pb/pl/pr`), so almost nothing derives.
   *
   * Only the NAMES live here, and `styleTokens` is a discriminator rather than
   * the token set itself, because this module is evaluated on the server
   * (`hasPlayground` runs there). The values come from `astralis-ui`, which is
   * a client module, so the panel resolves them client-side.
   */
  styleProps?: readonly string[];
  styleTokens?: "box" | "flex" | "grid";
}

/** What a registry file writes: a fixture is just the element tree. */
export interface PlaygroundSpec extends Omit<PlaygroundEntry, "fixture"> {
  fixture?: ReactNode;
}

export const asEntry = <P,>(component: ComponentType<P>) =>
  component as ComponentType<Record<string, unknown>>;

/* Built on first use, not at import. This module is also evaluated on the
   server, where `hasPlayground` only reads rows; the source is only ever asked
   for by the client-side PlaygroundView. */
let names: NameOf | undefined;
const nameOf: NameOf = (type, within) =>
  (names ??= namesFromModule(ui as unknown as Record<string, unknown>))(type, within);

/**
 * A fixture written as `<>…</>` becomes its children as a keyed array. Roots
 * like ButtonGroup, Stat and CodeBlock.Root pass props to their DIRECT
 * children by cloning them, and a fragment is one opaque child to that: the
 * buttons in a ButtonGroup fixture never received the group's size.
 */
function unwrapFragment(node: ReactNode): ReactNode {
  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment) {
    return Children.toArray(node.props.children);
  }
  return node;
}

function fixtureFor(tag: string, authored: ReactNode): PlaygroundFixture {
  const node = unwrapFragment(authored);
  let derived: JsxSource | undefined;
  const derive = () => (derived ??= toJsx(node, nameOf, tag));
  return {
    node,
    get source() {
      return derive().source;
    },
    get imports() {
      return derive().tags;
    },
  };
}

export function definePlaygrounds<K extends string>(
  specs: Record<K, PlaygroundSpec>,
): Record<K, PlaygroundEntry> {
  const entries = {} as Record<K, PlaygroundEntry>;
  for (const key of Object.keys(specs) as K[]) {
    const { fixture, ...rest } = specs[key];
    entries[key] = fixture === undefined ? rest : { ...rest, fixture: fixtureFor(rest.tag, fixture) };
  }
  return entries;
}
