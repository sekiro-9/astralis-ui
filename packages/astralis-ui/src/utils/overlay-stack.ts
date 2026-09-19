"use client";

/**
 * Module-level coordination for stacked overlays (Modal over Modal, Popover
 * inside a Drawer, a Select open in a Popover, ...). A lone overlay can't see
 * its siblings, so three things are decided here:
 *
 * - Body scroll lock is refcounted: the first overlay locks, the last restores.
 * - Escape belongs to the TOPMOST layer only, so it peels one layer at a time.
 * - A pointerdown inside a HIGHER layer is not "outside" for a lower one, even
 *   though portaled layers are DOM siblings of it.
 *
 * All functions are only called from effects and event handlers, so they are
 * SSR-safe.
 */

export interface OverlayLayerOptions {
  /** Whether a node belongs to this layer (its panel, trigger, ...). */
  contains?: (node: Node) => boolean;
  /**
   * A layer that never holds focus on its own (Tooltip, HoverCard, a picker's
   * listbox). It still takes Escape first, but it does not suspend the focus
   * trap of the modal beneath it.
   */
  transient?: boolean;
}

interface Layer extends OverlayLayerOptions {
  id: symbol;
}

const stack: Layer[] = [];
const handledEvents = new WeakSet<Event>();

let lockCount = 0;
let originalBodyOverflow = "";

/** Register an open overlay; returns the handle used for topmost checks. */
export function pushOverlay(options: OverlayLayerOptions = {}): symbol {
  const id = Symbol("astralis-overlay");
  stack.push({ id, ...options });
  return id;
}

export function popOverlay(id: symbol): void {
  const index = stack.findIndex((layer) => layer.id === id);
  if (index !== -1) stack.splice(index, 1);
}

/**
 * True when this overlay is the top of the stack (the one that owns Escape).
 * With `ignoreTransient`, transient layers above it are skipped: that is the
 * question a focus trap asks.
 */
export function isTopOverlay(id: symbol, { ignoreTransient = false }: { ignoreTransient?: boolean } = {}): boolean {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].id === id) return true;
    if (!ignoreTransient || !stack[i].transient) return false;
  }
  return false;
}

/** True when `node` sits inside a layer opened after `id`. */
export function isInHigherOverlay(id: symbol, node: Node): boolean {
  const index = stack.findIndex((layer) => layer.id === id);
  if (index === -1) return false;
  return stack.slice(index + 1).some((layer) => layer.contains?.(node) ?? false);
}

/**
 * Marks a key event as consumed by an overlay. A lower layer's listener can run
 * after the top layer has already closed and popped itself, when it would
 * otherwise see itself as topmost and close too.
 */
export function markOverlayEventHandled(event: Event): void {
  handledEvents.add(event);
}

export function isOverlayEventHandled(event: Event): boolean {
  return handledEvents.has(event);
}

/** Refcounted body scroll lock — the first lock saves, the last unlock restores. */
export function lockBodyScroll(): void {
  if (lockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount++;
}

export function unlockBodyScroll(): void {
  if (lockCount === 0) return; // stray unlock — nothing to restore
  lockCount--;
  if (lockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
  }
}
