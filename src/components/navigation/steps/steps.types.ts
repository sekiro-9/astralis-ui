import type { ReactNode } from "react";

export type StepsOrientation = "horizontal" | "vertical";
export type StepsSize = "sm" | "md" | "lg";

export interface StepsProps {
  /** Current active step (0-based index) */
  value: number;
  orientation?: StepsOrientation;
  size?: StepsSize;
  clickable?: boolean;
  onChange?: (step: number) => void;
  children: ReactNode;
}

export interface StepProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;

  /** @internal – injected by <Steps /> */
  index?: number;
}
