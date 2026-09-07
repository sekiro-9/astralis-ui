"use client";

import { createContext, useContext } from "react";

export type StepsOrientation = "horizontal" | "vertical";
export type StepsVariant = "solid" | "subtle" | "dot";
export type StepsSize = "sm" | "md" | "lg";
/** Where the title/description sit relative to the indicator (horizontal only). */
export type StepsLabelPlacement = "inline" | "bottom";

/** The resolved status of a single step. */
export type StepStatus = "upcoming" | "active" | "completed" | "error";

/** Screen-reader text for the statuses that are otherwise shown only by colour and icon. */
export interface StepsStatusLabels {
  /** @default "Completed" */
  completed?: string;
  /** @default "Error" */
  error?: string;
}

export interface StepsContextValue {
  /** Active step index (0-based). `step === count` means "all complete". */
  step: number;
  /** Navigate to a step. Clamped to [0, count]; respects `linear`. */
  setStep: (next: number) => void;
  /** Total number of steps (auto-counted by Steps.List). */
  count: number;
  setCount: (count: number) => void;
  orientation: StepsOrientation;
  variant: StepsVariant;
  size: StepsSize;
  linear: boolean;
  /** Horizontal only — `"bottom"` centers titles beneath the indicators. */
  labelPlacement: StepsLabelPlacement;
  /** When true, each indicator becomes a button that jumps to its step. */
  clickable: boolean;
  statusLabels: Required<StepsStatusLabels>;
}

export const StepsContext = createContext<StepsContextValue | null>(null);

export function useStepsContext(): StepsContextValue {
  const ctx = useContext(StepsContext);
  if (!ctx) throw new Error("Steps sub-components must be used within <Steps.Root>");
  return ctx;
}

export interface StepItemContextValue {
  index: number;
  status: StepStatus;
  disabled: boolean;
  isLast: boolean;
}

export const StepItemContext = createContext<StepItemContextValue | null>(null);

export function useStepItemContext(): StepItemContextValue {
  const ctx = useContext(StepItemContext);
  if (!ctx) throw new Error("This step part must be used within <Steps.Item>");
  return ctx;
}
