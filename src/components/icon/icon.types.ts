import type React from "react";
import * as LucideIcons from "lucide-react";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | number;
export type IconName = keyof typeof LucideIcons;

export interface BaseIconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: IconSize;
  strokeWidth?: number;
}

export interface IconProps extends BaseIconProps {
  name: IconName;
}