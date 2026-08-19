"use client";

import { Children, cloneElement, isValidElement, useEffect, type ReactElement } from "react";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveServerChild } from "../../../../utils/resolve-server-child";
import { useStepsContext } from "../steps.context";
import type { StepsListProps } from "../steps.types";

/**
 * Steps.List — the ordered list of steps. It counts its Item children (feeding
 * `count` back to the context) and injects each item's `index`. Connectors are
 * drawn by each Item itself, so the list stays a simple flex container.
 */
export function StepsList({ children, className, ...rest }: StepsListProps) {
  const { orientation, labelPlacement, setCount } = useStepsContext();

  // Double unwrap: a Server Component's children can arrive as one lazy node
  // wrapping the whole array, and each entry can be lazy again.
  const items = Children.toArray(resolveServerChild(children))
    .map(resolveServerChild)
    .filter(isValidElement) as ReactElement<{ index?: number }>[];
  const count = items.length;

  useEffect(() => {
    setCount(count);
  }, [count, setCount]);

  const listClass = astralisMerge(
    "astralis:flex",
    orientation === "vertical"
      ? "astralis:flex-col"
      : astralisMerge("astralis:w-full", labelPlacement === "bottom" ? "astralis:items-start" : "astralis:items-center"),
    className,
  );

  return (
    <ol role="list" className={listClass} {...rest}>
      {items.map((child, index) => cloneElement(child, { index }))}
    </ol>
  );
}

StepsList.displayName = "Steps.List";
