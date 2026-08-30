"use client";

import { splitPlacement } from "../../../utils/placement";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { useFieldContext } from "../field/field.context";
import { inputVariants } from "../input/input.styles";
import { flattenOptions, isGroup, OptionRow } from "../shared/options";
import { astralisMerge } from "../../../utils/astralis-merge";
import { menuPosition } from "../shared/menu-position";
import { accentClass } from "../../../const/color-schemes";
import { ChevronDownIcon, XIcon, SpinnerIcon } from "../../icon/internal-icons";
import type { ComboboxOptionOrGroup, ComboboxProps } from "./combobox.types";

/**
 * A filterable single-value picker on the ARIA combobox pattern: type to
 * filter, arrows to move the active option, Enter to commit, Escape to
 * revert. Built from the same shared option machinery as Select/MultiSelect.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      options = [],
      value,
      defaultValue = null,
      onChange,
      onInputChange,
      placeholder = "Search…",
      size = "md",
      variant = "outline",
      colorScheme = "brand",
      disabled: disabledProp,
      invalid: invalidProp,
      readOnly: readOnlyProp,
      clearable = false,
      allowCustomValue = false,
      loading = false,
      emptyText = "No matches",
      name,
      className = "",
      id: idProp,
      ...rest
    },
    ref,
  ) => {
    const { placementClass, placementStyle } = splitPlacement(rest);
    const field = useFieldContext();
    const isDisabled = disabledProp ?? field?.disabled;
    const isInvalid = invalidProp ?? field?.invalid;
    const isReadOnly = readOnlyProp ?? field?.readOnly;
    const id = idProp ?? field?.id;
    const listboxId = useId();

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string | number | null>(defaultValue);
    const selectedValue = isControlled ? (value ?? null) : internalValue;

    const flatAll = useMemo(() => flattenOptions(options), [options]);
    const selectedOption = useMemo(() => flatAll.find((o) => o.value === selectedValue) ?? null, [flatAll, selectedValue]);

    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState(selectedOption ? String(selectedOption.label) : "");
    const [activeIdx, setActiveIdx] = useState(-1);
    // Only filter by the text once the user has actually typed since opening —
    // reopening on a committed selection should show the full list.
    const [hasTyped, setHasTyped] = useState(false);

    // A custom value has no option to borrow a label from; it is its own text.
    const committedText = selectedOption
      ? String(selectedOption.label)
      : allowCustomValue && selectedValue != null
        ? String(selectedValue)
        : "";

    useEffect(() => {
      setText(committedText);
    }, [committedText]);

    const filtered = useMemo<ComboboxOptionOrGroup[]>(() => {
      const q = text.toLowerCase().trim();
      if (!hasTyped || !q) return options;
      return options
        .map((o): ComboboxOptionOrGroup | null => {
          if (isGroup(o)) {
            const matches = o.options.filter((opt) => opt.label.toLowerCase().includes(q));
            return matches.length ? { ...o, options: matches } : null;
          }
          return o.label.toLowerCase().includes(q) ? o : null;
        })
        .filter((o): o is ComboboxOptionOrGroup => o !== null);
    }, [options, text, hasTyped]);

    const flatFiltered = useMemo(() => flattenOptions(filtered), [filtered]);
    const navigable = useMemo(() => flatFiltered.filter((o) => !o.disabled), [flatFiltered]);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const updatePos = useCallback(() => {
      if (!inputRef.current) return;
      const r = inputRef.current.getBoundingClientRect();
      setPos(menuPosition(r, dropdownRef.current));
    }, []);

    useLayoutEffect(() => {
      if (!isOpen) return;
      updatePos();
      // Filtering changes the menu's height; a flipped menu must follow or
      // it drifts away from its anchor.
      const observer = new ResizeObserver(updatePos);
      if (dropdownRef.current) observer.observe(dropdownRef.current);
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);
      return () => {
        observer.disconnect();
        window.removeEventListener("scroll", updatePos, true);
        window.removeEventListener("resize", updatePos);
      };
    }, [isOpen, updatePos]);

    useEffect(() => {
      if (!isOpen) return;
      // Capture phase, deliberately: the press that dismisses this combobox
      // may also unmount it (selecting elsewhere in an app that swaps panels).
      // A bubble listener would be torn down mid-propagation and never fire,
      // silently dropping the typed text; capture runs before any of that.
      const handler = (e: PointerEvent) => {
        const target = e.target as Node;
        if (!inputRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
          settleRef.current();
        }
      };
      document.addEventListener("pointerdown", handler, true);
      return () => document.removeEventListener("pointerdown", handler, true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    /** Close; optionally revert the text to the committed selection. */
    const close = (revert: boolean) => {
      setIsOpen(false);
      setActiveIdx(-1);
      setHasTyped(false);
      if (revert) setText(committedText);
    };

    const commit = (next: string | number | null) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
      const picked = flatAll.find((o) => o.value === next) ?? null;
      setText(
        picked ? String(picked.label) : allowCustomValue && next != null ? String(next) : "",
      );
      setIsOpen(false);
      setActiveIdx(-1);
      setHasTyped(false);
    };

    /**
     * Commit whatever is typed (custom-value mode): an exact label match
     * commits that option, empty clears, anything else is the value itself.
     */
    const commitText = () => {
      const typed = text.trim();
      if (typed === committedText.trim()) {
        close(true);
        return;
      }
      if (typed === "") {
        commit(null);
        return;
      }
      const match = flatAll.find(
        (o) => !o.disabled && String(o.label).toLowerCase() === typed.toLowerCase(),
      );
      commit(match ? match.value : typed);
    };

    /** Leaving the field: custom mode keeps the typed text, picker mode drops it. */
    const settle = () => {
      if (allowCustomValue) commitText();
      else close(true);
    };

    // The outside-click listener attaches once per open and must not commit
    // the text it closed over — it reads the latest settle through a ref.
    const settleRef = useRef(settle);
    useEffect(() => {
      settleRef.current = settle;
    });

    const handleKeyDown = (e: ReactKeyboardEvent) => {
      if (isReadOnly || isDisabled) return;
      switch (e.key) {
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
          if (isOpen && activeIdx >= 0 && navigable[activeIdx]) {
            e.preventDefault();
            commit(navigable[activeIdx].value);
          } else if (allowCustomValue) {
            e.preventDefault();
            commitText();
          }
          break;
        case "Escape":
          if (isOpen) close(true);
          break;
        case "Tab":
          if (isOpen) settle();
          break;
      }
    };

    const handleClear = (e: ReactMouseEvent) => {
      e.stopPropagation();
      if (isReadOnly) return;
      commit(null);
      inputRef.current?.focus();
    };

    const showClear = clearable && selectedValue != null && !isDisabled && !isReadOnly;
    const activeOption = activeIdx >= 0 ? navigable[activeIdx] : null;

    return (
      <div
        className={astralisMerge("astralis:relative astralis:w-full", accentClass(colorScheme), placementClass, className)}
        style={placementStyle}
      >
        {name != null && <input type="hidden" name={name} value={selectedValue ?? ""} disabled={!!isDisabled} />}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeOption ? `${listboxId}-${String(activeOption.value)}` : undefined}
          aria-autocomplete="list"
          aria-invalid={isInvalid || undefined}
          aria-describedby={field?.describedBy}
          disabled={!!isDisabled || loading}
          readOnly={isReadOnly}
          required={field?.required}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setHasTyped(true);
            setActiveIdx(-1);
            onInputChange?.(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!isDisabled && !isReadOnly) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={astralisMerge(inputVariants({ size, variant, invalid: !!isInvalid }), "astralis:pr-9")}
        />
        <span className="astralis:absolute astralis:inset-y-0 astralis:right-3 astralis:flex astralis:items-center astralis:gap-1 astralis:text-label-subtle">
          {loading ? (
            <SpinnerIcon />
          ) : showClear ? (
            <button type="button" aria-label="Clear selection" onMouseDown={(e) => e.preventDefault()} onClick={handleClear} className="astralis:cursor-pointer astralis:transition-colors astralis:hover:text-label-base">
              <XIcon className="astralis:h-3.5 astralis:w-3.5" />
            </button>
          ) : (
            <ChevronDownIcon aria-hidden="true" className={astralisMerge("astralis:h-4 astralis:w-4 astralis:transition-transform", isOpen && "astralis:rotate-180")} />
          )}
        </span>

        {isOpen &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={dropdownRef}
              id={listboxId}
              role="listbox"
              style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
              className={astralisMerge(
                "astralis",
                accentClass(colorScheme),
                "astralis:max-h-64 astralis:overflow-auto astralis:rounded-xl astralis:border-normal astralis:border-stroke-base astralis:bg-surface-raised astralis:shadow-lg astralis:p-1",
              )}
            >
              {flatFiltered.length === 0 && (
                <div className="astralis:px-3 astralis:py-2 astralis:text-sm astralis:text-label-subtle">{emptyText}</div>
              )}
              {filtered.map((entry) =>
                isGroup(entry) ? (
                  <div key={entry.group} role="group" aria-label={entry.group}>
                    <div className="astralis:px-3 astralis:py-1.5 astralis:text-xs astralis:font-medium astralis:text-label-subtle">{entry.group}</div>
                    {entry.options.map((opt) => {
                      return (
                        <OptionRow
                          key={String(opt.value)}
                          id={`${listboxId}-${String(opt.value)}`}
                          option={opt}
                          isActive={navigable[activeIdx] === opt}
                          isSelected={opt.value === selectedValue}
                          onPick={commit}
                        />
                      );
                    })}
                  </div>
                ) : (
                  (() => {
                    return (
                      <OptionRow
                        key={String(entry.value)}
                        id={`${listboxId}-${String(entry.value)}`}
                        option={entry}
                        isActive={navigable[activeIdx] === entry}
                        isSelected={entry.value === selectedValue}
                        onPick={commit}
                      />
                    );
                  })()
                ),
              )}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

Combobox.displayName = "Combobox";
