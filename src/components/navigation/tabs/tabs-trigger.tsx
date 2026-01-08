import type { ButtonHTMLAttributes } from "react";
import { useTabsContext } from "./tabs.context";

interface TabsTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  value,
  disabled,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, setValue, size } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setValue(value)}
      className={[
        "astralis-rounded-md astralis-font-medium astralis-transition",
        size === "sm" && "astralis-px-2 astralis-py-1 astralis-text-xs",
        size === "md" && "astralis-px-3 astralis-py-2 astralis-text-sm",
        size === "lg" && "astralis-px-4 astralis-py-3 astralis-text-base",
        isActive
          ? "astralis-bg-primary-500 astralis-text-white"
          : "astralis-bg-transparent astralis-text-neutral-600 hover:astralis-bg-neutral-100",
        disabled && "astralis-opacity-50 astralis-pointer-events-none",
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
