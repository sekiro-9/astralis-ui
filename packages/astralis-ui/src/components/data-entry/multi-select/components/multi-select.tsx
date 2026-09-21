"use client";

import { splitPlacement } from "../../../../utils/placement";
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFieldContext } from "../../field/field.context";
import { msContainer, msFocusRing, msTagSizes, msInputText } from "../multi-select.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { useMenuPosition } from "../../shared/menu-position";
import { filterOptions, flattenOptions, isGroup, optionId, optionSearchText } from "../../shared/options";
import { OptionRow } from "../../shared/option-row";
import { consumeEscape, usePickerLayer } from "../../shared/use-picker-layer";
import { accentClass } from "../../../../const/color-schemes";
import { ChevronDownIcon, XIcon, SpinnerIcon } from "../../../icon/internal-icons";
import type { MultiSelectOptionItem, MultiSelectProps, MultiSelectSize } from "../multi-select.types";
import { identify } from "../../../../utils/dev-identity";

type Values = Array<string | number>;
const NO_VALUES: Values = [];

function Tag({
  label,
  name,
  onRemove,
  disabled,
  size,
}: {
  label: ReactNode;
  name: string;
  onRemove: () => void;
  disabled?: boolean;
  size: MultiSelectSize;
}) {
  return (
    <span
      className={astralisMerge(
        msTagSizes[size],
        "astralis:inline-flex astralis:items-center astralis:gap-1 astralis:rounded-sm astralis:font-medium astralis:bg-accent-subtle astralis:text-accent-label astralis:transition-colors",
      )}
    >
      <span className="astralis:truncate astralis:max-w-32">{label}</span>
      {!disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Remove ${name}`}
          onMouseDown={(e) => {
            e.preventDefault(); // don't blur the search input
            onRemove();
          }}
          className="astralis:flex astralis:items-center astralis:shrink-0 astralis:transition-colors astralis:hover:text-accent-solid"
        >
          <XIcon aria-hidden="true" className="astralis:h-2.5 astralis:w-2.5" />
        </button>
      )}
    </span>
  );
}

export const MultiSelectBase = identify("MultiSelect", forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options = [],
      value,
      defaultValue = NO_VALUES,
      onValueChange,
      onChange,
      placeholder = "Select options…",
      size = "md",
      variant = "outline",
      colorScheme = "brand",
      disabled: disabledProp,
      invalid: invalidProp,
      readOnly: readOnlyProp,
      clearable = false,
      max,
      emptyText = "No options",
      loading = false,
      name,
      className = "",
      id: idProp,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const { placementClass, rest: domRest } = splitPlacement(rest);
    const field = useFieldContext();
    const isDisabled = disabledProp ?? field?.disabled;
    const isInvalid = invalidProp ?? field?.invalid;
    const isReadOnly = readOnlyProp ?? field?.readOnly;
    const id = idProp ?? field?.id;
    const listboxId = useId();

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIdx, setActiveIdx] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);

    const [selectedValues, setSelectedValues] = useControllableState<Values>({
      value,
      defaultValue,
      onChange: (next) => {
        onValueChange?.(next);
        onChange?.(next);
      },
    });

    const flatAll = useMemo(() => flattenOptions(options), [options]);
    const selectedOptions = useMemo(
      () => flatAll.filter((o) => selectedValues.includes(o.value)),
      [flatAll, selectedValues],
    );

    const filteredOptions = useMemo(() => filterOptions(options, search), [options, search]);
    const flatFiltered = useMemo(() => flattenOptions(filteredOptions), [filteredOptions]);
    const isMaxReached = max != null && selectedValues.length >= max;
    // At the cap, unselected options can't be picked, so arrows skip them too.
    const isBlocked = (o: MultiSelectOptionItem) => !!o.disabled || (isMaxReached && !selectedValues.includes(o.value));
    const navigable = flatFiltered.filter((o) => !isBlocked(o));
    const activeOption = activeIdx >= 0 ? (navigable[activeIdx] ?? null) : null;

    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => containerRef.current!, []);

    const pos = useMenuPosition(isOpen, containerRef, dropdownRef);

    const closeMenu = () => {
      setIsOpen(false);
      setSearch("");
      setActiveIdx(-1);
    };

    usePickerLayer(isOpen, [containerRef, dropdownRef], closeMenu);

    useEffect(() => {
      if (isOpen) searchRef.current?.focus({ preventScroll: true });
    }, [isOpen]);

    const toggleValue = (val: string | number) => {
      if (isReadOnly) return;
      const next = selectedValues.includes(val)
        ? selectedValues.filter((v) => v !== val)
        : isMaxReached
          ? selectedValues
          : [...selectedValues, val];
      setSelectedValues(next);
    };

    const removeValue = (val: string | number) => {
      if (isReadOnly) return;
      setSelectedValues(selectedValues.filter((v) => v !== val));
    };

    const clearAll = (e: ReactMouseEvent) => {
      e.stopPropagation();
      if (isReadOnly) return;
      setSelectedValues([]);
      searchRef.current?.focus();
    };

    const handleContainerClick = (e: ReactMouseEvent) => {
      if (isDisabled || isReadOnly) return;
      // A click on the input already opened it through focus; only the rest
      // of the container toggles.
      if (e.target === searchRef.current) setIsOpen(true);
      else if (isOpen) closeMenu();
      else setIsOpen(true);
      searchRef.current?.focus();
    };

    const handleKeyDown = (e: ReactKeyboardEvent) => {
      if (isReadOnly) {
        if (e.key !== "Tab") e.preventDefault();
        return;
      }
      switch (e.key) {
        case "Backspace":
          if (!search && selectedValues.length > 0) removeValue(selectedValues[selectedValues.length - 1]);
          break;
        case "Escape":
          if (isOpen) {
            consumeEscape(e);
            closeMenu();
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          else setActiveIdx((i) => Math.min(i + 1, navigable.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIdx((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          else if (activeOption) toggleValue(activeOption.value);
          break;
        case "Tab":
          if (isOpen) closeMenu();
          break;
      }
    };

    const showClear = clearable && selectedValues.length > 0 && !isDisabled && !isReadOnly;

    const renderOption = (item: MultiSelectOptionItem) => (
      <OptionRow
        key={String(item.value)}
        id={optionId(listboxId, flatFiltered.indexOf(item))}
        option={isBlocked(item) && !item.disabled ? { ...item, disabled: true } : item}
        isActive={item === activeOption}
        isSelected={selectedValues.includes(item.value)}
        onPick={toggleValue}
      />
    );

    return (
      <div
        className={astralisMerge("astralis:relative astralis:w-full", accentClass(colorScheme), placementClass, className)}
        {...domRest}
      >
        {/* Native form bridge — one hidden input per selected value (repeated
            name), so the selection reaches <form> submission. */}
        {name != null &&
          selectedValues.map((v) => <input key={String(v)} type="hidden" name={name} value={v} disabled={!!isDisabled} />)}
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          className={astralisMerge(
            msContainer({ size, variant, invalid: !!isInvalid }),
            isFocused && !isReadOnly && msFocusRing(variant, !!isInvalid),
            isDisabled && "astralis:cursor-not-allowed astralis:opacity-moderate astralis:pointer-events-none",
            isReadOnly && "astralis:cursor-default astralis:bg-surface-muted",
          )}
        >
          {selectedOptions.map((opt) => (
            <Tag
              key={String(opt.value)}
              label={opt.label}
              name={optionSearchText(opt)}
              size={size}
              disabled={!!isDisabled || !!isReadOnly}
              onRemove={() => removeValue(opt.value)}
            />
          ))}

          <input
            ref={searchRef}
            id={id}
            type="text"
            role="combobox"
            autoComplete="off"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={activeOption ? optionId(listboxId, flatFiltered.indexOf(activeOption)) : undefined}
            aria-autocomplete="list"
            aria-label={ariaLabel ?? (ariaLabelledBy || field ? undefined : placeholder)}
            aria-labelledby={ariaLabelledBy}
            aria-invalid={isInvalid || undefined}
            aria-describedby={field?.describedBy}
            aria-required={field?.required || undefined}
            placeholder={selectedValues.length === 0 ? placeholder : ""}
            value={search}
            onChange={(e) => {
              if (isReadOnly) return;
              setSearch(e.target.value);
              setActiveIdx(-1);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              if (!isReadOnly) setIsOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            disabled={!!isDisabled}
            readOnly={isReadOnly}
            className={astralisMerge(
              "astralis:flex-1 astralis:min-w-16 astralis:bg-transparent astralis:outline-none astralis:text-label-base astralis:placeholder:text-label-subtle",
              msInputText[size],
            )}
          />

          <span className="astralis:flex astralis:items-center astralis:gap-1 astralis:shrink-0 astralis:ml-auto astralis:text-label-subtle">
            {loading ? (
              <SpinnerIcon />
            ) : (
              <>
                {showClear && (
                  <button
                    type="button"
                    aria-label="Clear all"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={clearAll}
                    className="astralis:flex astralis:items-center astralis:rounded-sm astralis:p-0.5 astralis:transition-colors astralis:hover:text-label-base astralis:outline-none astralis:focus-visible:outline-2 astralis:focus-visible:outline-accent-ring"
                  >
                    <XIcon aria-hidden="true" className="astralis:h-3.5 astralis:w-3.5" />
                  </button>
                )}
                <ChevronDownIcon
                  aria-hidden="true"
                  className={astralisMerge(
                    "astralis:h-4 astralis:w-4 astralis:shrink-0 astralis:transition-transform",
                    isOpen && "astralis:rotate-180",
                  )}
                />
              </>
            )}
          </span>
        </div>

        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
              className={astralisMerge(
                "astralis astralis:bg-surface-raised astralis:border-normal astralis:border-stroke-base astralis:rounded-xl astralis:shadow-lg astralis:overflow-hidden",
                accentClass(colorScheme),
              )}
            >
              {isMaxReached && (
                <div
                  role="status"
                  className="astralis:px-3 astralis:py-1.5 astralis:text-xs astralis:text-label-subtle astralis:border-b astralis:border-stroke-subtle astralis:bg-surface-subtle"
                >
                  Maximum {max} item{max !== 1 ? "s" : ""} selected
                </div>
              )}

              <div
                id={listboxId}
                role="listbox"
                aria-multiselectable="true"
                aria-labelledby={id}
                className="astralis:max-h-60 astralis:overflow-y-auto astralis:p-1.5"
              >
                {filteredOptions.length === 0 ? (
                  <div className="astralis:px-3 astralis:py-4 astralis:text-sm astralis:text-label-subtle astralis:text-center">
                    {emptyText}
                  </div>
                ) : (
                  filteredOptions.map((opt, i) =>
                    isGroup(opt) ? (
                      <div key={`g-${i}`} role="group" aria-label={opt.group}>
                        <div
                          aria-hidden="true"
                          className="astralis:px-2 astralis:pt-2 astralis:pb-1 astralis:text-xs astralis:font-semibold astralis:uppercase astralis:tracking-wider astralis:text-label-subtle"
                        >
                          {opt.group}
                        </div>
                        {opt.options.map(renderOption)}
                      </div>
                    ) : (
                      renderOption(opt)
                    ),
                  )
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
));
