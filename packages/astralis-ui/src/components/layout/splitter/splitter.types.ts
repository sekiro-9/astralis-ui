import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";

export type SplitterOrientation = "horizontal" | "vertical";

export interface SplitterProps extends Omit<ComponentPropsWithoutRef<"div">, "onResize"> {
  /** Split axis: "horizontal" = panels side by side. @default "horizontal" */
  orientation?: SplitterOrientation;
  /** Controlled first-panel share, percent (0–100). */
  size?: number;
  /** Default first-panel share, percent. @default 50 */
  defaultSize?: number;
  /** Fires with the first-panel share as it changes. */
  onResize?: (size: number) => void;
  /** Smallest first-panel share, percent. @default 10 */
  minSize?: number;
  /** Largest first-panel share, percent. @default 90 */
  maxSize?: number;
  /** Exactly two `Splitter.Panel`s with a `Splitter.Handle` between. */
  children: ReactNode;
}

export type SplitterPanelProps = ComponentPropsWithoutRef<"div">;
export type SplitterHandleProps = ComponentPropsWithoutRef<"div">;

export interface SplitterContextValue {
  orientation: SplitterOrientation;
  size: number;
  setSize: (size: number) => void;
  minSize: number;
  maxSize: number;
  containerRef: RefObject<HTMLDivElement | null>;
}
