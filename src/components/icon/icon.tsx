import { forwardRef } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BaseIconProps, IconProps } from "./icon.types";


const sizeMap: Record<
  NonNullable<BaseIconProps["size"]> extends number
    ? never
    : "xs" | "sm" | "md" | "lg" | "xl",
  number
> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    { name, size = "md", strokeWidth = 2, className = "", color, ...props },
    ref
  ) => {
    const IconComponent = LucideIcons[name] as LucideIcon | undefined;

    if (!IconComponent) {
      console.warn(`[Astralis Icon] Icon "${name}" not found in lucide-react`);
      return null;
    }

    const pixelSize = typeof size === "number" ? size : sizeMap[size];

    return (
      <IconComponent
        ref={ref}
        size={pixelSize}
        strokeWidth={strokeWidth}
        stroke={color ?? "currentColor"}
        className={`astralis-flex-shrink-0 ${className}`}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";

export default Icon;
