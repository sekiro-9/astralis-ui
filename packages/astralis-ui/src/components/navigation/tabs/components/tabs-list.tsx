"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { useTabsContext } from "../tabs.context";
import {
  tabsListVariants,
  tabsIndicatorVariants,
  tabsListWrapperVariants,
  tabsScrollButtonVariants,
} from "../tabs.styles";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../icon/internal-icons";
import type { TabsListProps } from "../tabs.types";

/** How far one press of a scroll button travels: most of a screenful. */
const SCROLL_STEP_RATIO = 0.8;

/**
 * Tabs.List — the tablist.
 *
 * Two behaviours live here:
 *
 * 1. For the `line` variant, a single indicator slides to the active trigger
 *    (measured from the DOM, recomputed on value change and on resize).
 *
 * 2. When a horizontal row is wider than the space available, the list scrolls
 *    inside itself and grows scroll buttons — the MUI `scrollButtons="auto"`
 *    model. Ant Design collapses overflow into a "more" dropdown instead; the
 *    long-running complaint about that is you cannot tell hidden tabs exist.
 *    Arrows keep it discoverable, and touch devices still get native swipe.
 *
 * Without this the row simply widened its parent, so a page with more tab
 * labels than viewport scrolled sideways as a whole.
 */
export function TabsList({ children, className, ...rest }: TabsListProps) {
  const { orientation, variant, rounded, value } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<CSSProperties>({ opacity: 0 });
  const [overflow, setOverflow] = useState({ start: false, end: false });

  const showIndicator = variant === "line";
  const scrollable = orientation === "horizontal";

  /* ---- sliding indicator ---- */
  useLayoutEffect(() => {
    if (!showIndicator) return;
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      if (!active) {
        setIndicator({ opacity: 0 });
        return;
      }
      setIndicator(
        orientation === "horizontal"
          ? { opacity: 1, left: active.offsetLeft, width: active.offsetWidth }
          : { opacity: 1, top: active.offsetTop, height: active.offsetHeight },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [showIndicator, orientation, value]);

  /* ---- overflow detection, so a button only appears when it would do something ---- */
  const syncOverflow = useCallback(() => {
    const list = listRef.current;
    if (!list || !scrollable) return;
    const max = list.scrollWidth - list.clientWidth;
    // Sub-pixel layout means scrollLeft never quite reaches max; 1px of slack
    // stops the end button flickering at rest.
    setOverflow({ start: list.scrollLeft > 1, end: list.scrollLeft < max - 1 });
  }, [scrollable]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !scrollable) return;

    syncOverflow();
    const observer = new ResizeObserver(syncOverflow);
    observer.observe(list);
    // Observe the triggers too: a label that reflows changes scrollWidth
    // without the list's own box ever resizing.
    for (const child of Array.from(list.children)) observer.observe(child);
    list.addEventListener("scroll", syncOverflow, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", syncOverflow);
    };
  }, [scrollable, syncOverflow, children]);

  /* ---- keep the active tab in view, WITHIN the strip ---- */
  useEffect(() => {
    if (!scrollable) return;
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!list || !active) return;

    // Deliberately not `scrollIntoView`: that walks every scrollable ancestor
    // up to the document, so a tab set mounted below the fold scrolled the
    // whole PAGE down to itself on load. Moving the strip's own scrollLeft
    // cannot touch anything outside the strip.
    const start = active.offsetLeft;
    const end = start + active.offsetWidth;

    if (start < list.scrollLeft) {
      list.scrollTo({ left: start, behavior: "smooth" });
    } else if (end > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: end - list.clientWidth, behavior: "smooth" });
    }
  }, [scrollable, value]);

  const scrollBy = (direction: -1 | 1) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({ left: direction * list.clientWidth * SCROLL_STEP_RATIO, behavior: "smooth" });
  };

  const tablist = (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      data-orientation={orientation}
      className={astralisMerge(
        tabsListVariants({ orientation, variant, rounded }),
        // Vertical keeps the old single-element shape, so consumer classes and
        // DOM props still land on the tablist itself.
        scrollable ? "" : className,
      )}
      {...(scrollable ? {} : rest)}
    >
      {children}
      {showIndicator && (
        <span
          aria-hidden="true"
          style={indicator}
          className={tabsIndicatorVariants({ orientation })}
        />
      )}
    </div>
  );

  if (!scrollable) return tablist;

  return (
    <div className={astralisMerge(tabsListWrapperVariants({ orientation }), className)} {...rest}>
      {overflow.start && (
        <button
          type="button"
          // The row is already fully reachable with arrow keys, so these are a
          // pointer convenience and stay out of the tab order.
          tabIndex={-1}
          aria-hidden="true"
          className={tabsScrollButtonVariants()}
          onClick={() => scrollBy(-1)}
        >
          <ChevronLeftIcon className="astralis:size-4" />
        </button>
      )}
      {tablist}
      {overflow.end && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className={tabsScrollButtonVariants()}
          onClick={() => scrollBy(1)}
        >
          <ChevronRightIcon className="astralis:size-4" />
        </button>
      )}
    </div>
  );
}

TabsList.displayName = "Tabs.List";
