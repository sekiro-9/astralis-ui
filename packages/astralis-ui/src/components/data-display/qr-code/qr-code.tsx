"use client";

import { useMemo, useRef } from "react";
import { splitPlacement } from "../../../utils/placement";
import { astralisMerge } from "../../../utils/astralis-merge";
import { encodeQr, qrPath } from "./qr-encoder";
import type { QrCodeRootProps, QrCodeSize } from "./qr-code.types";

const SIZE_PX: Record<QrCodeSize, number> = {
  sm: 96,
  md: 160,
  lg: 220,
  xl: 280,
};

/** Quiet zone, in modules, around the code. */
const MARGIN = 1;

function Spinner({ size }: { size: number }) {
  return (
    <svg
      width={size * 0.25}
      height={size * 0.25}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="astralis:animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function QrCodeRoot({
  value,
  size = "md",
  pixelSize,
  errorLevel = "M",
  color = "#000000",
  bgColor = "transparent",
  overlay,
  overlaySize = 20,
  status = "active",
  onRefresh,
  downloadable = false,
  downloadFileName = "qrcode",
  className,
  style,
  ...rest
}: QrCodeRootProps) {
  const { placementClass, placementStyle, rest: domRest } = splitPlacement(rest);
  const px = pixelSize ?? SIZE_PX[size];
  const svgRef = useRef<SVGSVGElement>(null);

  // Encoding is synchronous, so a render can never show a previous value.
  const code = useMemo(() => {
    if (!value) return null;
    try {
      const matrix = encodeQr(value, errorLevel);
      return { dimension: matrix.size + MARGIN * 2, path: qrPath(matrix, MARGIN) };
    } catch {
      return "error" as const;
    }
  }, [value, errorLevel]);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const markup = new XMLSerializer().serializeToString(svgRef.current);
    const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${downloadFileName}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const overlaySizePx = (px * overlaySize) / 100;
  const overlayOffset = (px - overlaySizePx) / 2;

  const isObscured =
    status === "loading" || status === "expired" || status === "scanned";

  return (
    <div
      className={astralisMerge(
        "astralis:inline-flex astralis:flex-col astralis:items-center astralis:gap-3",
        placementClass,
        className,
      )}
      style={{ ...placementStyle, ...style }}
      {...domRest}
    >
      <div
        className="astralis:relative astralis:rounded-lg astralis:border astralis:border-stroke-base astralis:bg-white astralis:overflow-hidden"
        style={{ width: px, height: px }}
      >
        {code && code !== "error" && (
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            width={px}
            height={px}
            viewBox={`0 0 ${code.dimension} ${code.dimension}`}
            shapeRendering="crispEdges"
            role="img"
            aria-label={value}
            style={{
              position: "absolute",
              inset: 0,
              filter: isObscured ? "blur(5px)" : "none",
              transition: "filter 0.3s",
            }}
          >
            {bgColor !== "transparent" && (
              <rect width={code.dimension} height={code.dimension} fill={bgColor} />
            )}
            <path d={code.path} fill={color} />
          </svg>
        )}

        {code === "error" && (
          <div className="astralis:absolute astralis:inset-0 astralis:flex astralis:items-center astralis:justify-center astralis:text-error-label astralis:text-xs astralis:p-2 astralis:text-center">
            Failed to generate QR code
          </div>
        )}

        {status === "loading" && (
          <div className="astralis:absolute astralis:inset-0 astralis:flex astralis:flex-col astralis:items-center astralis:justify-center astralis:gap-2 astralis:text-label-muted">
            <Spinner size={px} />
            <span className="astralis:text-xs astralis:font-medium">
              Loading…
            </span>
          </div>
        )}
        {status === "expired" && (
          <div className="astralis:absolute astralis:inset-0 astralis:flex astralis:flex-col astralis:items-center astralis:justify-center astralis:gap-2 astralis:text-label-muted">
            <svg
              width={px * 0.22}
              height={px * 0.22}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"
              />
            </svg>
            <span className="astralis:text-xs astralis:font-medium">
              Expired
            </span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="astralis:text-xs astralis:px-2 astralis:py-1 astralis:rounded astralis:bg-brand-solid astralis:text-brand-contrast astralis:hover:opacity-higher astralis:transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
        )}
        {status === "scanned" && (
          <div className="astralis:absolute astralis:inset-0 astralis:flex astralis:flex-col astralis:items-center astralis:justify-center astralis:gap-2 astralis:text-success-solid">
            <svg
              width={px * 0.25}
              height={px * 0.25}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
              />
            </svg>
            <span className="astralis:text-xs astralis:font-semibold">
              Scanned!
            </span>
          </div>
        )}

        {overlay && status === "active" && (
          <div
            className="astralis:absolute astralis:flex astralis:items-center astralis:justify-center astralis:bg-white astralis:rounded-md astralis:shadow-sm astralis:border astralis:border-stroke-base astralis:overflow-hidden"
            style={{
              width: overlaySizePx,
              height: overlaySizePx,
              top: overlayOffset,
              left: overlayOffset,
            }}
          >
            {overlay}
          </div>
        )}
      </div>

      {downloadable && status === "active" && (
        <button
          type="button"
          onClick={handleDownload}
          className={[
            "astralis:inline-flex astralis:items-center astralis:gap-1.5 astralis:text-xs astralis:font-medium",
            "astralis:px-3 astralis:py-1.5 astralis:rounded-lg astralis:border astralis:border-stroke-base",
            "astralis:bg-surface-base astralis:hover:bg-surface-subtle astralis:text-label-muted",
            "astralis:transition-colors astralis:duration-150",
          ].join(" ")}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
            <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.97a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.779a.749.749 0 1 1 1.06-1.06l1.97 1.97Z" />
          </svg>
          Download SVG
        </button>
      )}
    </div>
  );
}

QrCodeRoot.displayName = "QrCode.Root";
