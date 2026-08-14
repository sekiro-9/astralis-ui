"use client";

import { useMemo, useState } from "react";
import { Maximize2 } from "lucide-react";
import {
  BOX_STYLE_TOKENS,
  Button,
  CodeBlock,
  FLEX_STYLE_TOKENS,
  GRID_STYLE_TOKENS,
  Icon,
  Modal,
  Tabs,
} from "astralis-ui";
import {
  deriveControls,
  initialState,
  liveProps,
  styleControls,
  type PropValue,
} from "@/lib/playground/controls";
import { generateJsx } from "@/lib/playground/codegen";
import { useShikiHtml } from "@/lib/use-shiki";
import { playgrounds, type PlaygroundEntry, type PlaygroundName } from "@/modules/demos/playgrounds";
import { PlaygroundPanel } from "./playground-panel";

/**
 * The Playground tab: live component beside its controls, with the JSX that
 * produces exactly what you're looking at underneath.
 *
 * Controls are derived from the component's documented `PropRow[]` — the same
 * data the props table renders — so there is no second description of a
 * component's API to keep in step.
 *
 * State lives here rather than in the stage so the inline view and the expanded
 * modal are the *same* configuration: open the modal mid-edit and your props
 * come with you, close it and they stay.
 */

type PropState = Record<string, PropValue>;

function Stage({
  entry,
  state,
  content,
  overlay,
  className = "",
}: {
  entry: PlaygroundEntry;
  state: PropState;
  /** Named `content`, not `children`, so it stays a value we pass through
      rather than this component's own JSX children. */
  content: string;
  /** Pinned to the canvas's top-right — the expand affordance. */
  overlay?: React.ReactNode;
  className?: string;
}) {
  const Component = entry.component;
  /* A fixture wins over text children: composed components (Alert, ButtonGroup,
     Accordion) are configured by their parts, not by a label. */
  const kids = entry.fixture ? entry.fixture.node : entry.children === undefined ? undefined : content;
  /* baseProps first so a control always wins. Unset controls must not reach the
     component, or the stage would stop matching the code the rail is showing. */
  const props = liveProps({ ...entry.baseProps, ...state });
  return (
    <div
      className={`preview-grid relative flex items-center justify-center overflow-auto rounded-lg p-6 ${className}`}
    >
      {overlay && <div className="absolute right-2 top-2 z-10">{overlay}</div>}
      {/* Composed components (Alert, Accordion) are block-level and need a
          width to read correctly; a Badge or Button must stay centred at its
          natural size, so only fixtures get the wrapper. */}
      {entry.fixture ? (
        <div className="w-full max-w-md">
          <Component {...props}>{kids}</Component>
        </div>
      ) : (
        <Component {...props}>{kids}</Component>
      )}
    </div>
  );
}

function GeneratedCode({
  code,
  highlighted,
  className = "",
}: {
  code: string;
  highlighted: string | null;
  className?: string;
}) {
  return (
    <CodeBlock.Root
      variant="solid"
      code={code}
      className={`group relative rounded-xl border border-stroke-base bg-surface-subtle dark:bg-raised ${className}`}
    >
      <div className="absolute right-2.5 top-2.5 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <CodeBlock.CopyTrigger className="border border-stroke-base bg-surface text-label-muted hover:text-label" />
      </div>
      {/* min-h-0/flex-1 only bite when a parent constrains the height (the
          modal); inline the block is unconstrained and sizes to its content. */}
      <CodeBlock.Content className="shiki docs-scroll min-h-0 flex-1 overflow-auto p-4 text-[13px] leading-relaxed">
        {/* No highlight yet → Code falls back to Root's `code`, i.e. plain text
            of the CURRENT source, so fast edits never flash a stale highlight
            from the previous state. */}
        <CodeBlock.Code highlightedHtml={highlighted ?? undefined} />
      </CodeBlock.Content>
    </CodeBlock.Root>
  );
}

/**
 * The playground board: canvas on the left, a Controls/Code rail on the right.
 *
 * The rail is tabbed rather than stacked so the code doesn't steal width from
 * the canvas — the component being previewed is the point, and it gets the
 * whole left side.
 *
 * One component for both the inline tab and the modal; they drifted apart when
 * they were two copies, so the only difference now is the height cap passed in.
 */
function Board({
  entry,
  state,
  content,
  panel,
  code,
  highlighted,
  onReset,
  dirty,
  expandButton,
  wide = false,
  className = "",
}: {
  entry: PlaygroundEntry;
  state: PropState;
  content: string;
  panel: React.ReactNode;
  code: string;
  highlighted: string | null;
  onReset: () => void;
  dirty: boolean;
  /** Inline only — the modal is already expanded. */
  expandButton?: React.ReactNode;
  /** The modal has room for a rail wide enough to read code without scrolling. */
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      /* grid-rows-[minmax(0,1fr)]: a max-height alone doesn't shrink a grid
         row, so without this the rail's content pushes the canvas straight out
         of the capped card. */
      className={`grid gap-4 overflow-hidden rounded-xl border border-stroke-base px-3 py-4 sm:px-4 sm:py-5 lg:grid-rows-[minmax(0,1fr)] ${
        /* Inline is bounded by the docs article (~640px), so the rail stays
           narrow enough that the canvas is still the wider half. */
        wide ? "lg:grid-cols-[minmax(0,1fr)_420px]" : "lg:grid-cols-[minmax(0,1fr)_280px]"
      } ${className}`}
    >
      <Stage
        entry={entry}
        state={state}
        content={content}
        overlay={expandButton}
        className="min-h-56 lg:min-h-0"
      />

      <div className="flex min-h-0 flex-col lg:border-l lg:border-stroke-base lg:pl-5">
        <Tabs
          defaultValue="controls"
          variant="segmented"
          size="sm"
          keepMounted
          className="min-h-0 flex-1"
          style={{ gap: "var(--astralis-spacing-3)" }}
        >
          <div className="flex items-center justify-between gap-2">
            <Tabs.List aria-label="Playground rail">
              <Tabs.Trigger value="controls">Controls</Tabs.Trigger>
              <Tabs.Trigger value="code">Code</Tabs.Trigger>
            </Tabs.List>
            {/* Pinned outside the tab panels so it never scrolls away. */}
            <Button size="xs" variant="text" colorScheme="gray" onClick={onReset} disabled={!dirty}>
              Reset
            </Button>
          </div>

          {/* flex-1 + min-h-0 is what actually bounds these: min-h-0 alone lets
              a flex item size to its content and overflow the rail.
              docs-scroll gives the site's thin muted scrollbar. */}
          <Tabs.Content value="controls" className="docs-scroll min-h-0 flex-1 overflow-y-auto">
            {panel}
          </Tabs.Content>
          <Tabs.Content value="code" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <GeneratedCode code={code} highlighted={highlighted} className="flex min-h-0 flex-1 flex-col" />
          </Tabs.Content>
        </Tabs>
      </div>
    </div>
  );
}

/** Token vocabularies live in the library; this module is the client side. */
const STYLE_TOKENS = {
  box: BOX_STYLE_TOKENS,
  flex: FLEX_STYLE_TOKENS,
  grid: GRID_STYLE_TOKENS,
};

export function PlaygroundView({ name }: { name: PlaygroundName }) {
  const entry: PlaygroundEntry = playgrounds[name];
  const propControls = useMemo(() => deriveControls(entry.rows), [entry.rows]);
  const styleRail = useMemo(
    () =>
      entry.styleProps && entry.styleTokens
        ? styleControls(
            entry.styleProps,
            STYLE_TOKENS[entry.styleTokens],
            new Set(propControls.map((control) => control.prop)),
          )
        : [],
    [entry.styleProps, entry.styleTokens, propControls],
  );
  /* One state bag: style props are just more controls once derived, so codegen,
     reset and the unset rule all work on them without knowing the difference. */
  const controls = useMemo(
    () => [...propControls, ...styleRail],
    [propControls, styleRail],
  );
  const baseState = useMemo(() => initialState(controls), [controls]);

  const [state, setState] = useState<PropState>(baseState);
  const [children, setChildren] = useState(entry.children ?? "");
  const [expanded, setExpanded] = useState(false);

  const dirty =
    children !== (entry.children ?? "") ||
    Object.keys(baseState).some((key) => state[key] !== baseState[key]);

  const reset = () => {
    setState(baseState);
    setChildren(entry.children ?? "");
  };

  const code = generateJsx({
    tag: entry.tag,
    /* baseProps are emitted too — the snippet needs them to actually work. */
    props: { ...entry.baseProps, ...state },
    rows: entry.rows,
    children: entry.fixture
      ? entry.fixture.source
      : entry.children === undefined
        ? undefined
        : children,
    imports: entry.fixture?.imports,
    /* Narrower than the 72-col default: this renders in a side rail, so it
       should wrap to one prop per line rather than scroll sideways. */
    maxWidth: 40,
  });

  const highlighted = useShikiHtml(code, "tsx");

  const panelProps = {
    controls: propControls,
    styleControls: styleRail,
    state,
    onChange: (prop: string, value: PropValue) =>
      setState((prev) => ({ ...prev, [prop]: value })),
    childrenValue: children,
    childrenLabel: entry.childrenLabel,
    onChildrenChange: entry.children === undefined ? undefined : setChildren,
  };

  const expandButton = (
    <Button
      size="xs"
      variant="text"
      colorScheme="gray"
      aria-label="Expand the playground"
      leftIcon={<Icon as={Maximize2} size="xs" />}
      onClick={() => setExpanded(true)}
    />
  );

  return (
    <div className="my-6">
      {/* Capped inline so a component with many controls scrolls its rail
          instead of stretching the canvas into a tall empty box. */}
      <Board
        entry={entry}
        state={state}
        content={children}
        code={code}
        highlighted={highlighted}
        panel={<PlaygroundPanel {...panelProps} />}
        onReset={reset}
        dirty={dirty}
        expandButton={expandButton}
        className="lg:h-[28rem]"
      />

      {/* size="full" (max-w-[calc(100vw-2rem)]): the widest the library offers,
          and the three-column layout below needs it — "xl" is only max-w-2xl,
          which is narrower than the docs column this modal expands out of. */}
      <Modal open={expanded} onOpenChange={setExpanded} size="full">
        {/* A floor as well as a ceiling: components with few controls (Kbd,
            ThemeToggle) used to collapse to a letterbox, and the canvas is the
            point of expanding. Capped at the viewport so tall ones scroll the
            rail rather than the page. */}
        <Modal.Content className="flex max-h-[calc(100vh-3rem)] flex-col lg:min-h-[min(34rem,calc(100vh-3rem))]">
          <Modal.Header>
            <Modal.Title>{entry.tag} playground</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body className="flex min-h-0 flex-1 flex-col">
            <Board
              entry={entry}
              state={state}
              content={children}
              code={code}
              highlighted={highlighted}
              panel={<PlaygroundPanel {...panelProps} />}
              onReset={reset}
              dirty={dirty}
              wide
              className="min-h-0 flex-1"
            />
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </div>
  );
}
