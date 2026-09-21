"use client";

import type { KeyboardEvent, Ref } from "react";
import type { ToolbarProps, ToolbarGroupProps, ToolbarSeparatorProps } from "../toolbar.types";
import { toolbarRoot, toolbarVertical, toolbarGroup } from "../toolbar.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { splitPlacement } from "../../../../utils/placement";
import { useMergedRefs } from "../../../../utils/merge-refs";
import { useRovingFocus } from "../../../../hooks/use-roving-focus";
import { Separator } from "../../../layout/separator";
import { identify } from "../../../../utils/dev-identity";

/**
 * A `role="toolbar"` container for grouped controls: arrow keys move focus
 * between the focusable children (APG toolbar pattern), Home/End jump.
 * Compose with Button, SegmentedControl, CopyButton — anything focusable.
 */
export const ToolbarRoot = identify("Toolbar", function ToolbarRoot({
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
  const mergedRef = useMergedRefs(roving.containerRef, ref);
  const { placementClass, rest: domProps } = splitPlacement(rest);

  const handleKeyDown = (e: KeyboardEvent) => {
    onKeyDown?.(e as KeyboardEvent<HTMLDivElement>);
    roving.onKeyDown(e);
  };

  return (
    <div
      ref={mergedRef}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={astralisMerge(
        toolbarRoot,
        orientation === "vertical" && toolbarVertical,
        placementClass,
        className,
      )}
      {...domProps}
    >
      {children}
    </div>
  );
});

export const ToolbarGroup = identify("Toolbar.Group", function ToolbarGroup({ className = "", ...rest }: ToolbarGroupProps) {
  return <div role="group" className={astralisMerge(toolbarGroup, className)} {...rest} />;
});

/** A Separator preset matching the toolbar's cross axis. */
export const ToolbarSeparator = identify("Toolbar.Separator", function ToolbarSeparator({ className = "", ...rest }: ToolbarSeparatorProps) {
  return (
    <Separator
      orientation="vertical"
      className={astralisMerge("astralis:h-5 astralis:mx-1 astralis:self-center", className)}
      {...rest}
    />
  );
});
