import { h, icon, store } from "./dom.mjs";
import { ICONS, MARK } from "./icons.mjs";

/* The launcher: the Astralis mark, which opens the panel, and a pick button.
   It can be dragged anywhere on the screen and stays where it was left,
   across reloads, kept as a fraction of the viewport so a resize keeps it in
   the same corner. */

const MARGIN = 12;
/** How far the pointer must travel before a press becomes a drag, not a click. */
const DRAG_THRESHOLD = 4;
const DEFAULT_SPOT = { fx: 0.5, fy: 1 }; // bottom centre

export function createLauncher({ onToggle, onPick, onMove }) {
  const dot = h("span", { class: "dot", hidden: true });
  const markButton = h(
    "button",
    { class: "launcher-button mark", type: "button", "aria-label": "Astralis DevTools", "aria-expanded": "false", title: "Astralis DevTools (Shift+Alt+A)" },
    icon(MARK),
    dot,
  );
  const pickButton = h(
    "button",
    { class: "launcher-button", type: "button", "aria-label": "Pick a component", "aria-pressed": "false", title: "Pick a component (Shift+Alt+C)" },
    icon(ICONS.pick),
  );
  const element = h("div", { class: "launcher", role: "toolbar", "aria-label": "Astralis DevTools" }, markButton, h("span", { class: "launcher-sep" }), pickButton);

  let spot = { ...DEFAULT_SPOT, ...store.read("localStorage", "launcher") };
  let position = { x: 0, y: 0 };
  let suppressClick = false;

  const size = () => ({ width: element.offsetWidth || 88, height: element.offsetHeight || 44 });
  const room = () => {
    const { width, height } = size();
    return { w: Math.max(0, window.innerWidth - width - MARGIN * 2), h: Math.max(0, window.innerHeight - height - MARGIN * 2) };
  };
  const clamp = (value) => Math.min(1, Math.max(0, value));

  function place(x, y) {
    position = { x, y };
    element.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    onMove?.();
  }
  function placeFromSpot() {
    const { w, h: height } = room();
    place(MARGIN + spot.fx * w, MARGIN + spot.fy * height);
  }

  /* ---- dragging -------------------------------------------------------------- */

  let press = null;
  // The move and release are followed on the window: a quick drag leaves the launcher before it moves.
  function onPointerDown(event) {
    if (event.button !== 0) return;
    press = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: position.x, y: position.y, dragging: false };
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerUp, true);
  }
  function onPointerMove(event) {
    if (!press || event.pointerId !== press.id) return;
    const dx = event.clientX - press.startX;
    const dy = event.clientY - press.startY;
    if (!press.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      press.dragging = true;
      element.classList.add("dragging");
    }
    const { width, height } = size();
    place(
      Math.min(window.innerWidth - width - MARGIN, Math.max(MARGIN, press.x + dx)),
      Math.min(window.innerHeight - height - MARGIN, Math.max(MARGIN, press.y + dy)),
    );
  }
  function onPointerUp(event) {
    if (!press || event.pointerId !== press.id) return;
    window.removeEventListener("pointermove", onPointerMove, true);
    window.removeEventListener("pointerup", onPointerUp, true);
    window.removeEventListener("pointercancel", onPointerUp, true);
    if (press.dragging) {
      // Only the click this release makes, if it lands on the launcher at all.
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      element.classList.remove("dragging");
      const { w, h: height } = room();
      spot = { fx: w ? clamp((position.x - MARGIN) / w) : 1, fy: height ? clamp((position.y - MARGIN) / height) : 1 };
      store.write("localStorage", "launcher", spot);
    }
    press = null;
  }
  // The click that ends a drag is not a press of either button.
  function onClickCapture(event) {
    if (!suppressClick) return;
    suppressClick = false;
    event.stopPropagation();
    event.preventDefault();
  }

  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("click", onClickCapture, true);
  markButton.addEventListener("click", () => onToggle());
  pickButton.addEventListener("click", () => onPick());

  // Double-clicking the grip area sends the launcher home.
  element.addEventListener("dblclick", (event) => {
    if (event.target !== element) return;
    spot = { ...DEFAULT_SPOT };
    store.write("localStorage", "launcher", spot);
    element.classList.add("settling");
    placeFromSpot();
    setTimeout(() => element.classList.remove("settling"), 400);
  });

  return {
    element,
    /** Lay it out once it is in the document, and again whenever the viewport changes. */
    layout: placeFromSpot,
    rect: () => {
      const { width, height } = size();
      return { left: position.x, top: position.y, right: position.x + width, bottom: position.y + height, width, height };
    },
    setOpen(open) {
      element.dataset.open = String(open);
      markButton.setAttribute("aria-expanded", String(open));
    },
    setPicking(picking) {
      pickButton.setAttribute("aria-pressed", String(picking));
    },
    setCounts({ errors, warnings }) {
      dot.hidden = errors + warnings === 0;
      dot.className = errors > 0 ? "dot" : "dot advice";
      dot.textContent = String(errors > 0 ? errors : warnings);
      markButton.setAttribute(
        "aria-label",
        errors + warnings > 0
          ? `Astralis DevTools: ${errors} ${errors === 1 ? "error" : "errors"}, ${warnings} ${warnings === 1 ? "recommendation" : "recommendations"}`
          : "Astralis DevTools",
      );
    },
  };
}
