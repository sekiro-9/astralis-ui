"use client";

import { useMemo, useRef, type CSSProperties } from "react";
import SplitterContext from "../splitter.context";
import type { SplitterProps } from "../splitter.types";
import { splitterRoot, splitterRootVertical } from "../splitter.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { useControllableState } from "../../../../hooks/use-controllable-state";

/**
 * A two-panel split with a draggable, keyboard-resizable divider. The first
 * panel's share rides a CSS variable; panels are addressed by DOM order, so
 * the composition is just Panel / Handle / Panel.
 */
export function SplitterRoot({
  orientation = "horizontal",
  size: sizeProp,
  defaultSize = 50,
  onResize,
  minSize = 10,
  maxSize = 90,
  children,
  className = "",
  style,
  ...rest
}: SplitterProps) {
  const [size, setSizeRaw] = useControllableState({ value: sizeProp, defaultValue: defaultSize, onChange: onResize });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const ctx = useMemo(() => {
    const setSize = (next: number) => setSizeRaw(Math.min(maxSize, Math.max(minSize, next)));
    return { orientation, size, setSize, minSize, maxSize, containerRef };
  }, [orientation, size, setSizeRaw, minSize, maxSize]);

  return (
    <SplitterContext.Provider value={ctx}>
      <div
        ref={containerRef}
        className={astralisMerge(splitterRoot, orientation === "vertical" && splitterRootVertical, className)}
        style={{ "--astralis-splitter-size": `${size}%`, ...style } as CSSProperties}
        {...rest}
      >
        {children}
      </div>
    </SplitterContext.Provider>
  );
}

SplitterRoot.displayName = "Splitter";
