"use client";

import type { KeyboardEvent, Ref } from "react";
import type { ToolbarProps, ToolbarGroupProps } from "../toolbar.types";
import { toolbarRoot, toolbarVertical, toolbarGroup } from "../toolbar.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { useRovingFocus } from "../../../../hooks/use-roving-focus";
import { Separator } from "../../../layout/separator";

/**
 * A `role="toolbar"` container for grouped controls: arrow keys move focus
 * between the focusable children (APG toolbar pattern), Home/End jump.
 * Compose with Button, SegmentedControl, CopyButton — anything focusable.
 */
export function ToolbarRoot({
  orientation = "horizontal",
  label,
  children,
  className = "",
  onKeyDown,
  ref,
  ...rest
}: ToolbarProps & { ref?: Ref<HTMLDivElement> }) {
  const roving = useRovingFocus<HTMLDivElement>({
    itemSelector: "button, a[href], input, select, [tabindex]:not([tabindex='-1'])",
    orientation,
    typeahead: false,
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    onKeyDown?.(e as KeyboardEvent<HTMLDivElement>);
    roving.onKeyDown(e);
  };

  return (
    <div
      ref={(node) => {
        roving.containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={astralisMerge(toolbarRoot, orientation === "vertical" && toolbarVertical, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

ToolbarRoot.displayName = "Toolbar";

export function ToolbarGroup({ className = "", ...rest }: ToolbarGroupProps) {
  return <div role="group" className={astralisMerge(toolbarGroup, className)} {...rest} />;
}

ToolbarGroup.displayName = "Toolbar.Group";

/** A Separator preset matching the toolbar's cross axis. */
export function ToolbarSeparator({ className = "" }: { className?: string }) {
  return (
    <Separator
      orientation="vertical"
      className={astralisMerge("astralis:h-5 astralis:mx-1 astralis:self-center", className)}
    />
  );
}

ToolbarSeparator.displayName = "Toolbar.Separator";
