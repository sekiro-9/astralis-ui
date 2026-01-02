import { forwardRef, useState } from "react";
import type { ImageProps } from "./image.types";

const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      className = "",
      width,
      height,
      objectFit = "cover",
      loading = "lazy",
      srcset,
      sizes,
      placeholder = "empty",
      rounded = "none",
      onLoad,
      onError,
      ariaLabel,
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(true);

    const defaultPlaceholder =
      "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjNkI3MjgwIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBpZD0iU1ZHUmVwb19iZ0NhcnJpZXIiIHN0cm9rZS13aWR0aD0iMCI+PC9nPjxnIGlkPSJTVkdSZXBvX3RyYWNlckNhcnJpZXIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9nPjxnIGlkPSJTVkdSZXBvX2ljb25DYXJyaWVyIj48dGl0bGU+aW9uaWNvbnMtdjUtZTwvdGl0bGU+PHBhdGggZD0iTTQxNiw2NEg5NmE2NC4wNyw2NC4wNywwLDAsMC02NCw2NFYzODRhNjQuMDcsNjQuMDcsMCwwLDAsNjQsNjRINDE2YTY0LjA3LDY0LjA3LDAsMCwwLDY0LTY0VjEyOEE2NC4wNyw2NC4wNywwLDAsMCw0MTYsNjRaTTMzNiwxMjhhNDgsNDgsMCwxLDEtNDgsNDhBNDguMDUsNDguMDUsMCwwLDEsMzM2LDEyOFpNOTYsNDE2YTMyLDMyLDAsMCwxLTMyLTMyVjMxNi4zN2w5NC44NC04NC4zYTQ4LjA2LDQ4LjA2LDAsMCwxLDY1LjgsMS45bDY0Ljk1LDY0LjgxTDE3Mi4zNyw0MTZaTTQ0OCwzODRhMzIsMzIsMCwwLDEtMzIsMzJIMjE3LjYzTDMzOS4wNSwyOTQuNThhNDcuNzIsNDcuNzIsMCwwLDEsNjEuNjQtLjE2TDQ0OCwzMzMuODRaIj48L3BhdGggPjwvZz48L3N2Zz4=";

    const baseStyles = "astralis-transition-opacity duration-150 ease-in-out";

    const objectFits = {
      contain: "astralis-object-contain",
      cover: "astralis-object-cover",
      fill: "astralis-object-fill",
      none: "astralis-object-none",
      "scale-down": "astralis-object-scale-down",
    };

    const roundedStyles = {
      none: "astralis-rounded-none",
      sm: "astralis-rounded-sm",
      md: "astralis-rounded-md",
      lg: "astralis-rounded-lg",
      xl: "astralis-rounded-xl",
      "2xl": "astralis-rounded-2xl",
      "3xl": "astralis-rounded-3xl",
      full: "astralis-rounded-full",
    };

    const placeholderStyles =
      placeholder === "blur"
        ? "astralis-blur-sm astralis-opacity-50 astralis-transition-opacity duration-150 ease-in-out"
        : "";

    const loadingStyles = isLoading
      ? "astralis-animate-pulse astralis-bg-gray-200"
      : "";

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
    };

    return (
      <img
        ref={ref}
        src={
          placeholder !== "empty" && placeholder !== "blur"
            ? placeholder
            : isLoading
            ? defaultPlaceholder
            : src
        }
        alt={alt}
        className={`${baseStyles} ${objectFits[objectFit]} ${placeholderStyles} ${roundedStyles[rounded]} ${loadingStyles} ${className}`}
        width={width}
        height={height}
        loading={loading}
        srcSet={srcset}
        sizes={sizes}
        onLoad={handleLoad}
        onError={onError}
        aria-label={ariaLabel}
      />
    );
  }
);

Image.displayName = "Image";
export default Image;