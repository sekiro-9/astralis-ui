"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Monitor, Tablet, Smartphone, ExternalLink } from "lucide-react";
import { Button, Icon, Tabs } from "astralis-ui";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: null, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 375, icon: Smartphone },
] as const;

type ViewportId = (typeof VIEWPORTS)[number]["id"];

/**
 * Floor for the frame height, and a realistic desktop viewport.
 *
 * A page-level block (`min-h-screen` auth screens) is only ever as tall as the
 * frame it sits in, so measuring it would pin the frame to whatever height it
 * already had and the block would never get a full viewport to fill.
 */
const MIN_FRAME_HEIGHT = 720;

interface BlockWorkbenchProps {
  id: string;
  name: string;
  code: ReactNode;
}

/**
 * The block viewer: a resizable live frame plus its source.
 *
 * The preview is an iframe so narrowing it actually narrows the *viewport* the
 * block sees — a CSS-resized div would keep resolving `lg:` against the page
 * and the mobile toggle would be a lie.
 *
 * Height is driven from the frame's own content. Same-origin lets us read it
 * directly instead of setting up a postMessage channel, and a ResizeObserver on
 * the inner body keeps it correct when the width changes reflow the block.
 */
export function BlockWorkbench({ id, name, code }: BlockWorkbenchProps) {
  const [viewport, setViewport] = useState<ViewportId>("desktop");
  const [height, setHeight] = useState(MIN_FRAME_HEIGHT);
  const frameRef = useRef<HTMLIFrameElement>(null);

  /**
   * Measure the element the preview page wraps the block in, not `body`. The
   * body stretches to the iframe's height, so it can only ever report the block
   * as taller than the frame — never shorter, which would leave dead space
   * under a short block forever.
   */
  const measure = useCallback(() => {
    const target = frameRef.current?.contentDocument?.querySelector("[data-block-frame]");
    if (target) {
      setHeight(Math.max(target.getBoundingClientRect().height, MIN_FRAME_HEIGHT));
    }
  }, []);

  // Re-observe on every load: navigating the frame swaps the document, so an
  // observer bound to the previous body would go silent.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let observer: ResizeObserver | undefined;

    const attach = () => {
      measure();
      const target = frame.contentDocument?.querySelector("[data-block-frame]");
      if (!target) return;
      observer?.disconnect();
      observer = new ResizeObserver(measure);
      observer.observe(target);
    };

    frame.addEventListener("load", attach);
    if (frame.contentDocument?.readyState === "complete") attach();

    return () => {
      frame.removeEventListener("load", attach);
      observer?.disconnect();
    };
  }, [measure]);

  // Switching viewport reflows the block to a different height. Measure right
  // away and again once the width transition has settled, rather than relying
  // on the observer to catch every intermediate frame.
  useEffect(() => {
    measure();
    const timer = setTimeout(measure, 350);
    return () => clearTimeout(timer);
  }, [viewport, measure]);

  const width = VIEWPORTS.find((entry) => entry.id === viewport)?.width ?? null;

  return (
    <Tabs
      defaultValue="preview"
      variant="segmented"
      size="sm"
      style={{ gap: "var(--astralis-spacing-3)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs.List aria-label="Block view">
          <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
          <Tabs.Trigger value="code">Code</Tabs.Trigger>
        </Tabs.List>

        <div className="flex items-center gap-1">
          {VIEWPORTS.map((entry) => (
            <Button
              key={entry.id}
              size="xs"
              variant={viewport === entry.id ? "subtle" : "text"}
              colorScheme={viewport === entry.id ? "brand" : "gray"}
              aria-pressed={viewport === entry.id}
              aria-label={entry.label}
              title={entry.label}
              onClick={() => setViewport(entry.id)}
            >
              <Icon as={entry.icon} size="xs" />
            </Button>
          ))}
          <Button
            as="a"
            href={`/preview/blocks/${id}`}
            target="_blank"
            rel="noreferrer"
            size="xs"
            variant="text"
            colorScheme="gray"
            aria-label="Open preview in a new tab"
            title="Open in new tab"
          >
            <Icon as={ExternalLink} size="xs" />
          </Button>
        </div>
      </div>

      <Tabs.Content value="preview">
        <div className="overflow-hidden rounded-xl border border-stroke-base bg-surface-subtle p-0 sm:p-4">
          <iframe
            ref={frameRef}
            src={`/preview/blocks/${id}`}
            title={`${name} preview`}
            className="mx-auto block w-full border-0 bg-surface transition-[width] duration-300 sm:rounded-lg"
            style={{ width: width ?? "100%", maxWidth: "100%", height }}
          />
        </div>
      </Tabs.Content>

      <Tabs.Content value="code">{code}</Tabs.Content>
    </Tabs>
  );
}
