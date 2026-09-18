"use client";

import { useState } from "react";
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode, Ref, RefObject } from "react";
import { sliderTrackH, sliderThumbSize, CENTER_XY } from "../slider.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { accentClass, type ColorScheme } from "../../../../const/color-schemes";
import { toPercent } from "../slider.utils";
import type { SliderTrackHandlers } from "../use-slider-pointer";
import type { SliderMark, SliderSize } from "../slider.types";

function ValueTooltip({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      style={{ bottom: "100%", left: "50%", transform: "translateX(-50%)" }}
      className="astralis:absolute astralis:mb-2 astralis:pointer-events-none"
    >
      <div className="astralis:relative astralis:rounded-sm astralis:bg-surface-inverted astralis:px-1.5 astralis:py-0.5 astralis:text-xs astralis:font-medium astralis:text-label-inverted astralis:whitespace-nowrap astralis:shadow-sm">
        {children}
        <div
          style={{ top: "100%", left: "50%", transform: "translateX(-50%) rotate(45deg)", marginTop: "-3px" }}
          className="astralis:absolute astralis:h-2 astralis:w-2 astralis:bg-surface-inverted"
        />
      </div>
    </div>
  );
}

export interface SliderThumbProps extends Pick<HTMLAttributes<HTMLDivElement>, "id" | "aria-label" | "aria-labelledby" | "aria-describedby"> {
  index: number;
  value: number;
  min: number;
  max: number;
  size: SliderSize;
  valueText?: string;
  invalid: boolean;
  disabled: boolean;
  readOnly: boolean;
  showTooltip: boolean;
  dragging: boolean;
  thumbRef: (node: HTMLDivElement | null) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  /** Bounds the thumb can travel to — a range thumb stops at its sibling. */
  ariaMin: number;
  ariaMax: number;
}

export function SliderThumb({
  index,
  value,
  min,
  max,
  size,
  valueText,
  invalid,
  disabled,
  readOnly,
  showTooltip,
  dragging,
  thumbRef,
  onKeyDown,
  ariaMin,
  ariaMax,
  ...aria
}: SliderThumbProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      ref={thumbRef}
      role="slider"
      data-thumb-index={index}
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={ariaMin}
      aria-valuemax={ariaMax}
      aria-valuenow={value}
      aria-valuetext={valueText}
      aria-orientation="horizontal"
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      aria-invalid={invalid || undefined}
      {...aria}
      style={{ left: `${toPercent(value, min, max)}%`, ...CENTER_XY }}
      className={astralisMerge(
        "astralis:absolute astralis:rounded-full astralis:border-moderate astralis:bg-surface-base astralis:shadow-md astralis:transition-shadow",
        "astralis:outline-none astralis:focus-visible:ring-2 astralis:focus-visible:ring-offset-1 astralis:focus-visible:ring-offset-surface-base",
        sliderThumbSize[size],
        invalid
          ? "astralis:border-error-solid astralis:focus-visible:ring-error-muted"
          : "astralis:border-accent-solid astralis:focus-visible:ring-accent-ring",
        disabled
          ? "astralis:cursor-not-allowed astralis:border-stroke-base"
          : readOnly
            ? "astralis:cursor-default"
            : "astralis:cursor-grab astralis:active:cursor-grabbing astralis:hover:shadow-lg",
      )}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      {showTooltip && (hovering || dragging) && <ValueTooltip>{valueText ?? value}</ValueTooltip>}
    </div>
  );
}

interface SliderFrameProps extends HTMLAttributes<HTMLDivElement> {
  rootRef?: Ref<HTMLDivElement>;
  trackRef: RefObject<HTMLDivElement | null>;
  trackHandlers: SliderTrackHandlers;
  min: number;
  max: number;
  size: SliderSize;
  colorScheme: ColorScheme;
  invalid: boolean;
  disabled: boolean;
  readOnly: boolean;
  /** Filled segment of the track, as [start, end] values. */
  fill: [number, number];
  marks: SliderMark[];
  /** Hidden inputs that carry the value into a surrounding form. */
  formValues?: { name: string; values: number[] };
  placementClass: string;
}

/** Root, track, fill and marks; the thumbs arrive as children. */
export function SliderFrame({
  rootRef,
  trackRef,
  trackHandlers,
  min,
  max,
  size,
  colorScheme,
  invalid,
  disabled,
  readOnly,
  fill,
  marks,
  formValues,
  placementClass,
  className,
  children,
  ...rest
}: SliderFrameProps) {
  const [fillStart, fillEnd] = [toPercent(fill[0], min, max), toPercent(fill[1], min, max)];

  return (
    <div
      ref={rootRef}
      className={astralisMerge(
        "astralis:relative astralis:w-full astralis:select-none",
        accentClass(colorScheme),
        marks.some((m) => m.label) && "astralis:mb-6",
        disabled && "astralis:opacity-moderate",
        readOnly && "astralis:opacity-high",
        placementClass,
        className,
      )}
      {...rest}
    >
      <div
        ref={trackRef}
        {...trackHandlers}
        // Without this a touch drag scrolls the page instead of moving the thumb.
        style={{ touchAction: "none" }}
        className={astralisMerge(
          "astralis:relative astralis:w-full astralis:rounded-full astralis:bg-surface-muted",
          sliderTrackH[size],
          disabled ? "astralis:cursor-not-allowed" : readOnly ? "astralis:cursor-default" : "astralis:cursor-pointer",
        )}
      >
        <div
          aria-hidden="true"
          style={{ top: 0, bottom: 0, left: `${fillStart}%`, width: `${fillEnd - fillStart}%` }}
          className={astralisMerge("astralis:absolute astralis:rounded-full", invalid ? "astralis:bg-error-solid" : "astralis:bg-accent-solid")}
        />
        {marks.map((mark) => {
          const active = mark.value >= fill[0] && mark.value <= fill[1];
          return (
            <div
              key={mark.value}
              aria-hidden="true"
              style={{ left: `${toPercent(mark.value, min, max)}%`, ...CENTER_XY }}
              className="astralis:absolute astralis:pointer-events-none"
            >
              <div
                className={astralisMerge(
                  "astralis:h-1.5 astralis:w-1.5 astralis:rounded-full astralis:border-normal",
                  active
                    ? "astralis:bg-accent-solid astralis:border-accent-solid"
                    : "astralis:bg-surface-base astralis:border-stroke-base",
                )}
              />
              {mark.label && (
                <span
                  style={{ left: "50%", transform: "translateX(-50%)" }}
                  className="astralis:absolute astralis:top-3 astralis:text-xs astralis:text-label-muted astralis:whitespace-nowrap"
                >
                  {mark.label}
                </span>
              )}
            </div>
          );
        })}
        {children}
      </div>
      {formValues?.values.map((v, i) => (
        <input key={i} type="hidden" name={formValues.name} value={v} disabled={disabled} />
      ))}
    </div>
  );
}

SliderThumb.displayName = "SliderThumb";

SliderFrame.displayName = "SliderFrame";
