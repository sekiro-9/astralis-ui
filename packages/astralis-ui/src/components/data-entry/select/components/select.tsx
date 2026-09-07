"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useFieldContext } from "../../field/field.context";
import { selectClearOffset, selectTrigger, SELECT_CLEAR_SIZE } from "../select.styles";
import { filterOptions, flattenOptions, isGroup, optionId } from "../../shared/options";
import { OptionRow } from "../../shared/option-row";
import { useMenuPosition } from "../../shared/menu-position";
import { consumeEscape, usePickerLayer } from "../../shared/use-picker-layer";
import { splitPlacement } from "../../../../utils/placement";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { useControllableState } from "../../../../hooks/use-controllable-state";
import { accentClass } from "../../../../const/color-schemes";
import { ChevronDownIcon, XIcon, SearchIcon, SpinnerIcon } from "../../../icon/internal-icons";
import type { SelectOptionItem, SelectProps } from "../select.types";

type Value = string | number | null;

export const SelectBase = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options = [],
      value,
      defaultValue = null,
      onValueChange,
      onChange,
      onClear,
      placeholder = "Select an option",
      size = "md",
      variant = "outline",
      colorScheme = "brand",
      disabled: disabledProp,
      invalid: invalidProp,
      readOnly: readOnlyProp,
      clearable = false,
      searchable = false,
      loading = false,
      emptyText = "No options",
      name,
      className = "",
      id: idProp,
      style,
      ...props
    },
    ref,
  ) => {
    const field = useFieldContext();
    const isDisabled = disabledProp ?? field?.disabled;
    const isInvalid = invalidProp ?? field?.invalid;
    const isReadOnly = readOnlyProp ?? field?.readOnly;
    const baseId = useId();
    const triggerId = idProp ?? field?.id ?? `${baseId}-trigger`;
    const listboxId = `${baseId}-listbox`;

    const [selectedValue, setSelectedValue] = useControllableState<Value>({
      value,
      defaultValue,
      onChange: (next) => {
        onValueChange?.(next);
        onChange?.(next);
      },
    });

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIdx, setActiveIdx] = useState(-1);

    const flatAll = useMemo(() => flattenOptions(options), [options]);
    const selectedOption = useMemo(() => flatAll.find((o) => o.value === selectedValue) ?? null, [flatAll, selectedValue]);

    const filteredOptions = useMemo(
      () => (searchable ? filterOptions(options, search) : options),
      [options, search, searchable],
    );
    const flatFiltered = useMemo(() => flattenOptions(filteredOptions), [filteredOptions]);
    const navigable = useMemo(() => flatFiltered.filter((o) => !o.disabled), [flatFiltered]);
    const activeOption = activeIdx >= 0 ? (navigable[activeIdx] ?? null) : null;
    const activeId = activeOption ? optionId(listboxId, flatFiltered.indexOf(activeOption)) : undefined;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => triggerRef.current!, []);

    const pos = useMenuPosition(isOpen, triggerRef, dropdownRef);

    const openMenu = () => {
      // Open on the current selection, so the active option starts where the value is.
      setActiveIdx(navigable.findIndex((o) => o.value === selectedValue));
      setIsOpen(true);
    };
    const closeMenu = ({ focusTrigger = false } = {}) => {
      setIsOpen(false);
      setSearch("");
      setActiveIdx(-1);
      if (focusTrigger) triggerRef.current?.focus();
    };

    usePickerLayer(isOpen, [triggerRef, dropdownRef], () => closeMenu());

    useEffect(() => {
      if (isOpen && searchable) searchRef.current?.focus({ preventScroll: true });
    }, [isOpen, searchable]);

    const handleSelect = (next: string | number) => {
      setSelectedValue(next);
      closeMenu({ focusTrigger: true });
    };

    const handleClear = () => {
      if (isReadOnly) return;
      setSelectedValue(null);
      onClear?.();
      triggerRef.current?.focus();
    };

    const moveActive = (e: ReactKeyboardEvent, next: (i: number) => number) => {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, Math.min(next(i), navigable.length - 1)));
    };

    /** Keys shared by the trigger and the search input while the menu is open. */
    const handleOpenKeys = (e: ReactKeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          moveActive(e, (i) => i + 1);
          break;
        case "ArrowUp":
          moveActive(e, (i) => (i < 0 ? navigable.length - 1 : i - 1));
          break;
        case "Home":
          moveActive(e, () => 0);
          break;
        case "End":
          moveActive(e, () => navigable.length - 1);
          break;
        case "Enter":
          e.preventDefault();
          if (activeOption) handleSelect(activeOption.value);
          break;
        case "Escape":
          consumeEscape(e);
          closeMenu({ focusTrigger: true });
          break;
      }
    };

    const handleTriggerKeyDown = (e: ReactKeyboardEvent) => {
      if (isReadOnly) {
        if (e.key !== "Tab") e.preventDefault();
        return;
      }
      if (e.key === "Tab") {
        if (isOpen) closeMenu();
        return;
      }
      if (!isOpen) {
        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          openMenu();
        }
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        if (activeOption) handleSelect(activeOption.value);
        return;
      }
      handleOpenKeys(e);
    };

    // The search input takes printable keys (Space included) as text.
    const handleSearchKeyDown = (e: ReactKeyboardEvent) => {
      if (e.key === "Tab") {
        // Moving focus back to the trigger first makes Tab continue from the
        // Select's place in the page, not from the portal at the end of body.
        closeMenu({ focusTrigger: true });
        return;
      }
      handleOpenKeys(e);
    };

    // `style` was taken out above, so the rest carries no style of its own:
    // placement vars go to the wrapper, the caller's style to the trigger.
    const { placementClass, placementStyle, rest: triggerProps } = splitPlacement(props);
    const { onClick: onClickProp, onKeyDown: onKeyDownProp, ...buttonProps } = triggerProps;

    const showClear = clearable && selectedValue != null && !isDisabled && !isReadOnly && !loading;

    const renderOption = (item: SelectOptionItem) => (
      <OptionRow
        key={String(item.value)}
        id={optionId(listboxId, flatFiltered.indexOf(item))}
        option={item}
        isActive={item === activeOption}
        isSelected={item.value === selectedValue}
        onPick={handleSelect}
      />
    );

    return (
      <div
        className={astralisMerge("astralis:relative astralis:w-full", placementClass, accentClass(colorScheme), className)}
        style={placementStyle}
      >
        {/* Native form bridge — the trigger is a <button>, so without this
            the selected value would never reach <form> submission. */}
        {name != null && <input type="hidden" name={name} value={selectedValue ?? ""} disabled={!!isDisabled} />}
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={isOpen && !searchable ? activeId : undefined}
          aria-invalid={isInvalid || undefined}
          aria-describedby={field?.describedBy}
          aria-readonly={isReadOnly || undefined}
          aria-required={field?.required || undefined}
          disabled={!!isDisabled || loading}
          {...buttonProps}
          onClick={(e) => {
            onClickProp?.(e);
            if (e.defaultPrevented || isDisabled || isReadOnly || loading) return;
            if (isOpen) closeMenu();
            else openMenu();
          }}
          onKeyDown={(e) => {
            onKeyDownProp?.(e);
            if (!e.defaultPrevented) handleTriggerKeyDown(e);
          }}
          style={style}
          className={astralisMerge(
            selectTrigger({ size, variant, invalid: !!isInvalid }),
            isReadOnly && "astralis:cursor-default astralis:bg-surface-muted",
          )}
        >
          <span
            className={astralisMerge(
              "astralis:flex-1 astralis:truncate",
              selectedOption ? "astralis:text-label-base" : "astralis:text-label-subtle",
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>

          <span aria-hidden="true" className="astralis:flex astralis:items-center astralis:gap-1 astralis:shrink-0 astralis:text-label-subtle">
            {loading ? (
              <SpinnerIcon />
            ) : (
              <>
                {showClear && <span className="astralis:shrink-0" style={{ width: SELECT_CLEAR_SIZE }} />}
                <ChevronDownIcon
                  className={astralisMerge(
                    "astralis:h-4 astralis:w-4 astralis:shrink-0 astralis:transition-transform",
                    isOpen && "astralis:rotate-180",
                  )}
                />
              </>
            )}
          </span>
        </button>

        {showClear && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={handleClear}
            className="astralis:absolute astralis:flex astralis:items-center astralis:rounded-sm astralis:p-0.5 astralis:text-label-subtle astralis:cursor-pointer astralis:transition-colors astralis:hover:text-label-base astralis:outline-none astralis:focus-visible:outline-2 astralis:focus-visible:outline-accent-ring"
            style={{ ...selectClearOffset(size, variant), top: "50%", transform: "translateY(-50%)" }}
          >
            <XIcon aria-hidden="true" className="astralis:h-3.5 astralis:w-3.5" />
          </button>
        )}

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
              {searchable && (
                <div className="astralis:p-2 astralis:border-b astralis:border-stroke-subtle">
                  <div className="astralis:flex astralis:items-center astralis:gap-2 astralis:px-2.5 astralis:h-8 astralis:rounded-lg astralis:border-normal astralis:border-stroke-base astralis:bg-surface-subtle">
                    <SearchIcon aria-hidden="true" className="astralis:h-3.5 astralis:w-3.5 astralis:shrink-0 astralis:text-label-subtle" />
                    <input
                      ref={searchRef}
                      aria-label="Search options"
                      aria-controls={listboxId}
                      aria-activedescendant={activeId}
                      aria-autocomplete="list"
                      type="text"
                      autoComplete="off"
                      placeholder="Search…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setActiveIdx(-1);
                      }}
                      onKeyDown={handleSearchKeyDown}
                      className="astralis:flex-1 astralis:text-sm astralis:bg-transparent astralis:outline-none astralis:text-label-base astralis:placeholder:text-label-subtle"
                    />
                  </div>
                </div>
              )}

              <div id={listboxId} role="listbox" aria-labelledby={triggerId} className="astralis:max-h-60 astralis:overflow-y-auto astralis:p-1.5">
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
);

SelectBase.displayName = "Select";
