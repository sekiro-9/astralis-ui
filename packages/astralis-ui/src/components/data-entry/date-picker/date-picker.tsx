"use client";

import type { Ref } from "react";
import { splitPlacement } from "../../../utils/placement";
import { useControllableState } from "../../../hooks/use-controllable-state";
import { astralisMerge } from "../../../utils/astralis-merge";
import { accentClass } from "../../../const/color-schemes";
import { identify, IDENTITY_ATTRIBUTE, PROPS_ATTRIBUTE } from "../../../utils/dev-identity";
import { inputVariants } from "../input/input.styles";
import { useFieldContext } from "../field/field.context";
import { Popover } from "../../overlay/popover";
import { Calendar, type CalendarValue } from "../../data-display/calendar";
import { CalendarIcon } from "../../icon/internal-icons";
import type { DatePickerProps, DatePickerValue } from "./date-picker.types";
import { formatValue, isRange, toFormValue } from "./date-picker.utils";

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: "medium" };

const triggerClasses = "astralis:inline-flex astralis:items-center astralis:gap-2 astralis:cursor-pointer astralis:text-left";

const clearClasses =
  "astralis:cursor-pointer astralis:rounded-md astralis:px-2 astralis:py-1 astralis:text-xs astralis:font-medium " +
  "astralis:text-label-muted astralis:transition-colors astralis:hover:bg-surface-subtle astralis:hover:text-label-base " +
  "astralis:outline-none astralis:focus-visible:ring-2 astralis:focus-visible:ring-accent-ring";

/**
 * A field that opens a Calendar to pick a date, or a start and end date.
 * The field is a button, so the value is always a real date: there is no
 * free typing to parse. `name` submits it with a form as an ISO date.
 */
export const DatePicker = identify("DatePicker", function DatePicker({
  selectionMode = "single",
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder = selectionMode === "range" ? "Pick a date range" : "Pick a date",
  locale = "en-US",
  formatOptions = DEFAULT_FORMAT,
  minDate,
  maxDate,
  isDateUnavailable,
  firstDayOfWeek,
  defaultMonth,
  size = "md",
  variant = "outline",
  colorScheme,
  invalid: invalidProp,
  disabled: disabledProp,
  clearable = true,
  name,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  className = "",
  id: idProp,
  ref,
  ...rest
}: DatePickerProps & { ref?: Ref<HTMLButtonElement> }) {
  const { placementClass, rest: placed } = splitPlacement(rest);
  // The field is rendered through Popover.Trigger, so the development identity
  // goes to the trigger, which chains its own name after this one's.
  const { [IDENTITY_ATTRIBUTE]: identity, [PROPS_ATTRIBUTE]: identityProps, ...domProps } = placed as typeof placed & Record<string, unknown>;

  const field = useFieldContext();
  const isInvalid = invalidProp ?? field?.invalid;
  const isDisabled = disabledProp ?? field?.disabled;
  const id = idProp ?? field?.id;

  const [value, setValue] = useControllableState<DatePickerValue>({ value: valueProp, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useControllableState<boolean>({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });

  const text = formatValue(value, locale, formatOptions);
  const picked = isRange(value) ? value.start : value;

  const handleSelect = (next: CalendarValue) => {
    // Calendar speaks three modes; this picker only ever asks for two of them.
    if (Array.isArray(next)) return;
    setValue(next);
    const complete = next === null ? false : isRange(next) ? Boolean(next.start && next.end) : true;
    if (complete) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} side={side} align={align}>
      <Popover.Trigger {...{ [IDENTITY_ATTRIBUTE]: identity, [PROPS_ATTRIBUTE]: identityProps }}>
        <button
          type="button"
          ref={ref}
          id={id}
          disabled={isDisabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={field?.describedBy}
          className={astralisMerge(
            inputVariants({ size, variant, invalid: Boolean(isInvalid) }),
            triggerClasses,
            text === null && "astralis:text-label-subtle",
            colorScheme && accentClass(colorScheme),
            placementClass,
            className,
          )}
          {...domProps}
        >
          <span className="astralis:min-w-0 astralis:flex-1 astralis:truncate">{text ?? placeholder}</span>
          <CalendarIcon aria-hidden="true" className="astralis:size-4 astralis:shrink-0 astralis:text-label-subtle" />
        </button>
      </Popover.Trigger>
      <Popover.Content
        aria-label={selectionMode === "range" ? "Choose a date range" : "Choose a date"}
        className={astralisMerge("astralis:max-w-none astralis:p-3", colorScheme && accentClass(colorScheme))}
      >
        <Calendar
          selectionMode={selectionMode}
          value={value}
          onValueChange={handleSelect}
          defaultMonth={picked ?? defaultMonth}
          locale={locale}
          firstDayOfWeek={firstDayOfWeek}
          minDate={minDate}
          maxDate={maxDate}
          isDateUnavailable={isDateUnavailable}
          colorScheme={colorScheme}
          size="sm"
        />
        {clearable && value !== null && (
          <div className="astralis:mt-2 astralis:flex astralis:justify-end astralis:border-t astralis:border-stroke-subtle astralis:pt-2">
            <button type="button" className={clearClasses} onClick={() => setValue(null)}>
              Clear
            </button>
          </div>
        )}
      </Popover.Content>
      {name && <input type="hidden" name={name} value={toFormValue(value)} />}
    </Popover>
  );
});
