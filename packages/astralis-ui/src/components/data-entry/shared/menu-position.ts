/**
 * Where a picker's portalled menu goes: below its anchor, or flipped above
 * when the viewport has no room below and more room above. Shared by
 * Select, Combobox, and MultiSelect so the three can never disagree about
 * collision handling.
 *
 * The menu's own height is measured from the rendered dropdown — the caller
 * passes its element (null on the first frame, when 0 keeps the menu below;
 * the layout effect re-runs with the real height before paint).
 */
export function menuPosition(
  anchor: DOMRect,
  menu: HTMLElement | null,
  gap = 4,
): { top: number; left: number; width: number } {
  const height = menu?.getBoundingClientRect().height ?? 0;
  const roomBelow = window.innerHeight - anchor.bottom - gap;
  const roomAbove = anchor.top - gap;
  const flip = height > roomBelow && roomAbove > roomBelow;

  return {
    top: flip ? Math.max(gap, anchor.top - gap - height) : anchor.bottom + gap,
    left: anchor.left,
    width: anchor.width,
  };
}
