import type { ReactNode } from "react";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsSize = "sm" | "md" | "lg";

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: TabsOrientation;
  size?: TabsSize;
  children: ReactNode;
}

export interface TabsContextValue {
  value?: string;
  orientation: TabsOrientation;
  size: TabsSize;
  setValue: (value: string) => void;
}
