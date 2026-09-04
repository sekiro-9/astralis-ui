"use client";

import { useMemo } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, Ref } from "react";
import { splitPlacement } from "../../../../utils/placement";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useFieldContext } from "../../field/field.context";
import { buildMarks, clamp, snapToStep, valueForKey } from "../slider.utils";
import { SliderFrame, SliderThumb } from "./slider-core";
import { useSliderPointer } from "../use-slider-pointer";
import type { RangeSliderProps, SliderProps } from "../slider.types";

function joinIds(...ids: Array<string | undefined>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

export function SliderBase({
  min = 0,
  max = 100,
  step = 1,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  onChange,
  size = "md",
  colorScheme = "brand",
  showTooltip = true,
  marks,
  disabled: disabledProp,
  invalid: invalidProp,
  readOnly: readOnlyProp,
  name,
  getAriaValueText,
  className = "",
  id: idProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ref,
  ...rest
}: SliderProps & { ref?: Ref<HTMLDivElement> }) {
  const { placementClass, rest: domRest } = splitPlacement(rest);
  const field = useFieldContext();
  const isDisabled = !!(disabledProp ?? field?.disabled);
  const isInvalid = !!(invalidProp ?? field?.invalid);
  const isReadOnly = !!(readOnlyProp ?? field?.readOnly);
  const interactive = !isDisabled && !isReadOnly;

  const [raw, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: (next: number) => {
      onValueChange?.(next);
      onChange?.(next);
    },
  });
  const value = clamp(raw, min, max);
  const commit = (next: number) => {
    if (next !== value) setValue(next);
  };

  const { trackRef, thumbRefs, activeThumb, trackHandlers } = useSliderPointer({
    min,
    max,
    step,
    interactive,
    pickThumb: () => 0,
    onDrag: (_, next) => commit(next),
  });

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const next = valueForKey(e.key, value, min, max, step);
    if (next === null) return;
    e.preventDefault();
    commit(next);
  };

  const marksArr = useMemo(() => buildMarks(marks, min, max, step), [marks, min, max, step]);

  return (
    <SliderFrame
      rootRef={ref}
      trackRef={trackRef}
      trackHandlers={trackHandlers}
      min={min}
      max={max}
      size={size}
      colorScheme={colorScheme}
      invalid={isInvalid}
      disabled={isDisabled}
      readOnly={isReadOnly}
      fill={[min, value]}
      marks={marksArr}
      formValues={name ? { name, values: [value] } : undefined}
      placementClass={placementClass}
      className={className}
      {...domRest}
    >
      <SliderThumb
        index={0}
        id={idProp ?? field?.id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : field?.labelledBy)}
        aria-describedby={joinIds(ariaDescribedBy, field?.describedBy)}
        value={value}
        valueText={getAriaValueText?.(value)}
        min={min}
        max={max}
        ariaMin={min}
        ariaMax={max}
        size={size}
        invalid={isInvalid}
        disabled={isDisabled}
        readOnly={isReadOnly}
        showTooltip={showTooltip}
        dragging={activeThumb === 0}
        thumbRef={(node) => {
          thumbRefs.current[0] = node;
        }}
        onKeyDown={handleKeyDown}
      />
    </SliderFrame>
  );
}

SliderBase.displayName = "Slider";

export function RangeSliderBase({
  min = 0,
  max = 100,
  step = 1,
  value: valueProp,
  defaultValue = [20, 80],
  onValueChange,
  onChange,
  size = "md",
  colorScheme = "brand",
  showTooltip = true,
  marks,
  disabled: disabledProp,
  invalid: invalidProp,
  readOnly: readOnlyProp,
  name,
  getAriaValueText,
  thumbLabels = ["Start value", "End value"],
  className = "",
  id: idProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ref,
  ...rest
}: RangeSliderProps & { ref?: Ref<HTMLDivElement> }) {
  const { placementClass, rest: domRest } = splitPlacement(rest);
  const field = useFieldContext();
  const isDisabled = !!(disabledProp ?? field?.disabled);
  const isInvalid = !!(invalidProp ?? field?.invalid);
  const isReadOnly = !!(readOnlyProp ?? field?.readOnly);
  const interactive = !isDisabled && !isReadOnly;

  const [raw, setValue] = useControllableState<[number, number]>({
    value: valueProp,
    defaultValue,
    onChange: (next) => {
      onValueChange?.(next);
      onChange?.(next);
    },
  });
  const value: [number, number] = [clamp(raw[0], min, max), clamp(raw[1], min, max)];

  // A thumb stops one step short of its sibling, so the two never cross.
  const moveThumb = (thumb: number, target: number) => {
    const next: [number, number] =
      thumb === 0
        ? [snapToStep(Math.min(target, value[1] - step), min, max, step), value[1]]
        : [value[0], snapToStep(Math.max(target, value[0] + step), min, max, step)];
    if (next[0] !== value[0] || next[1] !== value[1]) setValue(next);
  };

  const { trackRef, thumbRefs, activeThumb, trackHandlers } = useSliderPointer({
    min,
    max,
    step,
    interactive,
    pickThumb: (target) => {
      const toStart = Math.abs(target - value[0]);
      const toEnd = Math.abs(target - value[1]);
      if (toStart !== toEnd) return toStart < toEnd ? 0 : 1;
      return target < value[0] ? 0 : 1;
    },
    onDrag: moveThumb,
  });

  const handleKeyDown = (thumb: 0 | 1) => (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const next = valueForKey(e.key, value[thumb], min, max, step);
    if (next === null) return;
    e.preventDefault();
    moveThumb(thumb, next);
  };

  const marksArr = useMemo(() => buildMarks(marks, min, max, step), [marks, min, max, step]);
  const describedBy = joinIds(ariaDescribedBy, field?.describedBy);

  const thumb = (index: 0 | 1) => (
    <SliderThumb
      key={index}
      index={index}
      aria-label={thumbLabels[index]}
      aria-describedby={describedBy}
      value={value[index]}
      valueText={getAriaValueText?.(value[index])}
      min={min}
      max={max}
      ariaMin={index === 0 ? min : value[0]}
      ariaMax={index === 0 ? value[1] : max}
      size={size}
      invalid={isInvalid}
      disabled={isDisabled}
      readOnly={isReadOnly}
      showTooltip={showTooltip}
      dragging={activeThumb === index}
      thumbRef={(node) => {
        thumbRefs.current[index] = node;
      }}
      onKeyDown={handleKeyDown(index)}
    />
  );

  return (
    <SliderFrame
      rootRef={ref}
      role="group"
      id={idProp ?? field?.id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : field?.labelledBy)}
      trackRef={trackRef}
      trackHandlers={trackHandlers}
      min={min}
      max={max}
      size={size}
      colorScheme={colorScheme}
      invalid={isInvalid}
      disabled={isDisabled}
      readOnly={isReadOnly}
      fill={value}
      marks={marksArr}
      formValues={name ? { name, values: value } : undefined}
      placementClass={placementClass}
      className={className}
      {...domRest}
    >
      {thumb(0)}
      {thumb(1)}
    </SliderFrame>
  );
}

RangeSliderBase.displayName = "RangeSlider";
