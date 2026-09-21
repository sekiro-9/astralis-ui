"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { Portal } from "../../overlay/portal";
import { astralisMerge } from "../../../utils/astralis-merge";
import { markOverlayEventHandled } from "../../../utils/overlay-stack";
import { accentClass } from "../../../const/color-schemes";
import { XIcon } from "../../icon/internal-icons";
import { STATUS_ICON, STATUS_SCHEME, statusRole } from "../status";
import { getToasts, removeToast, subscribeToasts, toast } from "./toast-store";
import {
  toasterBaseClasses,
  toasterRegionClasses,
  toastPanelClasses,
  toastMotionClasses,
  toastIconClasses,
  toastTitleClasses,
  toastDescriptionClasses,
  toastActionClasses,
  toastCloseClasses,
} from "./toast.styles";
import type { ToastData, ToasterPlacement, ToasterProps } from "./toast.types";
import { identify } from "../../../utils/dev-identity";

const EXIT_DURATION = 200;
/** How long an announcement stays in the live region before it is cleared. */
const ANNOUNCE_DURATION = 1000;

function ToastItem({
  data,
  placement,
  returnFocusRef,
}: {
  data: ToastData;
  placement: ToasterPlacement;
  returnFocusRef: RefObject<HTMLElement | null>;
}) {
  const { id, open, status = "info", colorScheme, title, description, duration = 5000, closable = true, action } = data;
  const StatusIcon = STATUS_ICON[status];

  // Auto-dismiss that holds while the pointer is over the toast or focus is
  // inside it (WCAG 2.2.1), and re-arms with the time that was left.
  const remainingRef = useRef(duration ?? 0);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdRef = useRef({ hover: false, focus: false });

  const pause = useCallback(() => {
    if (timerRef.current == null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    remainingRef.current -= Date.now() - startedAtRef.current;
  }, []);

  const resume = useCallback(() => {
    const held = holdRef.current.hover || holdRef.current.focus;
    if (duration == null || !open || held || timerRef.current != null) return;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => toast.dismiss(id), Math.max(0, remainingRef.current));
  }, [duration, open, id]);

  useEffect(() => {
    resume();
    return pause;
  }, [resume, pause]);

  // Enter transition: mount with the "closed" styles, flip on the next frame
  // (double-RAF guarantees the closed styles painted first — usePresence's trick).
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Remove from the store once the exit transition has played.
  useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => removeToast(id), EXIT_DURATION);
    return () => clearTimeout(timer);
  }, [open, id]);

  const dismiss = () => {
    toast.dismiss(id);
    const target = returnFocusRef.current;
    if (target?.isConnected) target.focus();
  };

  const visible = open && entered;

  return (
    <div
      data-status={status}
      onMouseEnter={() => {
        holdRef.current.hover = true;
        pause();
      }}
      onMouseLeave={() => {
        holdRef.current.hover = false;
        resume();
      }}
      onFocus={() => {
        holdRef.current.focus = true;
        pause();
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        holdRef.current.focus = false;
        resume();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !closable) return;
        // Consumed here, so a Modal or Popover behind the toast stays open.
        e.stopPropagation();
        markOverlayEventHandled(e.nativeEvent);
        dismiss();
      }}
      className={astralisMerge(toastPanelClasses, toastMotionClasses(visible, placement), accentClass(colorScheme ?? STATUS_SCHEME[status]))}
    >
      <span aria-hidden="true" className={toastIconClasses}>
        <StatusIcon className="astralis:size-full" />
      </span>
      <div className="astralis:flex-1 astralis:min-w-0">
        <div className={toastTitleClasses}>{title}</div>
        {description && <div className={toastDescriptionClasses}>{description}</div>}
      </div>
      {action && (
        <button type="button" onClick={action.onClick} className={toastActionClasses}>
          {action.label}
        </button>
      )}
      {closable && (
        <button type="button" aria-label="Dismiss notification" onClick={dismiss} className={toastCloseClasses}>
          <XIcon aria-hidden="true" className="astralis:h-4 astralis:w-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Screen reader announcements. The live regions are mounted empty with the
 * Toaster and only ever gain children: a region inserted already filled (one
 * per toast) is announced inconsistently across screen readers. Each entry is
 * cleared after a moment, so the text is not read twice in browse mode.
 */
function useAnnouncements(toasts: ToastData[]): ToastData[] {
  const [announcements, setAnnouncements] = useState<ToastData[]>([]);
  const seen = useRef(new Set<string>());
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const live = new Set(toasts.map((t) => t.id));
    seen.current.forEach((id) => {
      if (!live.has(id)) seen.current.delete(id);
    });
    const fresh = toasts.filter((t) => t.open && !seen.current.has(t.id));
    if (fresh.length === 0) return;
    fresh.forEach((t) => seen.current.add(t.id));
    setAnnouncements((list) => [...list, ...fresh]);
    const ids = new Set(fresh.map((t) => t.id));
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setAnnouncements((list) => list.filter((t) => !ids.has(t.id)));
    }, ANNOUNCE_DURATION);
    timers.current.add(timer);
  }, [toasts]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return announcements;
}

/**
 * The toast outlet — mount ONE near the app root (inside AstralisProvider),
 * then fire notifications from anywhere with `toast(...)`.
 */
export const Toaster = identify("Toaster", function Toaster({ placement = "bottom-end", max = 5 }: ToasterProps) {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);
  const announcements = useAnnouncements(toasts);
  // Where focus was before it entered the toasts, for Escape and ✕ to return it.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Newest toasts win the visible slots; overflow stays queued in the store.
  const visible = toasts.slice(-max);
  const ordered = placement.startsWith("top") ? [...visible].reverse() : visible;

  const announce = (politeness: "alert" | "status") =>
    announcements
      .filter((t) => statusRole(t.status ?? "info") === politeness)
      .map((t) => (
        <div key={t.id}>
          {t.title}
          {t.description ? <>. {t.description}</> : null}
        </div>
      ));

  return (
    <Portal>
      <div className="astralis:sr-only" aria-live="polite" aria-relevant="additions text" data-astralis-toast-announcer="polite">
        {announce("status")}
      </div>
      <div className="astralis:sr-only" aria-live="assertive" aria-relevant="additions text" data-astralis-toast-announcer="assertive">
        {announce("alert")}
      </div>
      <div
        role="region"
        aria-label="Notifications"
        onFocus={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            returnFocusRef.current = e.relatedTarget as HTMLElement | null;
          }
        }}
        className={astralisMerge("astralis", toasterBaseClasses, toasterRegionClasses[placement])}
      >
        {ordered.map((t) => (
          <ToastItem key={t.id} data={t} placement={placement} returnFocusRef={returnFocusRef} />
        ))}
      </div>
    </Portal>
  );
});
