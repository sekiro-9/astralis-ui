import { forwardRef } from "react";
import type { ButtonProps } from "./button.types";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "astralis-inline-flex astralis-items-center astralis-justify-center astralis-font-medium astralis-rounded-lg astralis-transition-colors focus:astralis-outline-none focus:astralis-ring-2 focus:astralis-ring-offset-2 disabled:astralis-opacity-50 disabled:astralis-cursor-not-allowed";

    const variants = {
      primary:
        "astralis-bg-primary-600 astralis-text-white hover:astralis-bg-primary-700 focus:astralis-ring-primary-500",
      secondary:
        "astralis-bg-secondary-200 astralis-text-secondary-900 hover:astralis-bg-secondary-300 focus:astralis-ring-secondary-500",
      outline:
        "astralis-border astralis-border-secondary-300 astralis-bg-transparent hover:astralis-bg-secondary-50 focus:astralis-ring-primary-500",
      ghost:
        "astralis-bg-transparent hover:astralis-bg-secondary-100 focus:astralis-ring-primary-500",
      danger:
        "astralis-bg-error-600 astralis-text-white hover:astralis-bg-error-700 focus:astralis-ring-error-500",
    };

    const sizes = {
      xs: "astralis-px-2 astralis-h-7 astralis-text-xs",
      sm: "astralis-px-3 astralis-h-8 astralis-text-sm",
      md: "astralis-px-4 astralis-h-10 astralis-text-base",
      lg: "astralis-px-6 astralis-h-12 astralis-text-lg",
      xl: "astralis-px-8 astralis-h-14 astralis-text-xl",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="astralis-mr-2 astralis-animate-spin fon">
            <svg
              className="astralis-h-4 astralis-w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="astralis-opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="astralis-opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
