import { h, icon } from "./dom.mjs";
import { IDENTITY_ATTRIBUTE, readIdentity } from "./identity.mjs";
import { ICONS } from "./icons.mjs";

/* Picking a component on the page, and the outline that shows one. While
   picking, the page never sees the pointer: no click, no navigation, no menu. */

export function createPicker({ host, shadow, onPicked, onChange }) {
  const label = h("span", { class: "label" });
  const highlight = h("div", { class: "highlight", hidden: true }, label);
  const toast = h(
    "div",
    { class: "toast", role: "status", hidden: true },
    icon(ICONS.pick),
    h("span", {}, "Click a component to inspect it"),
    h("span", { class: "kbd" }, "Esc"),
  );
  shadow.append(highlight, toast);

  let picking = false;
  let hovered = null;
  let shown = null; // the element outlined when not picking

  const named = (target) => {
    if (!(target instanceof Element) || target === host || host.contains(target)) return null;
    return target.closest(`[${IDENTITY_ATTRIBUTE}]`);
  };

  function outline(element) {
    if (!element?.isConnected) {
      highlight.hidden = true;
      return;
    }
    const rect = element.getBoundingClientRect();
    Object.assign(highlight.style, {
      transform: `translate(${rect.left}px, ${rect.top}px)`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    highlight.classList.toggle("below", rect.top < 32);
    label.replaceChildren(
      h("span", {}, readIdentity(element).map((c) => c.name).join(" → ")),
      h("span", { class: "size" }, `${Math.round(rect.width)}×${Math.round(rect.height)}`),
    );
    highlight.hidden = false;
  }

  const refresh = () => outline(picking ? hovered : shown);

  function onPointerMove(event) {
    const next = named(event.target);
    if (next === hovered) return;
    hovered = next;
    refresh();
  }

  function swallow(event) {
    if (event.target === host) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function onClick(event) {
    if (event.target === host) return;
    swallow(event);
    const element = named(event.target);
    stop();
    if (element) onPicked(element);
  }

  function start() {
    if (picking) return;
    picking = true;
    toast.hidden = false;
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerdown", swallow, true);
    document.addEventListener("mousedown", swallow, true);
    document.addEventListener("click", onClick, true);
    onChange(true);
  }

  function stop() {
    if (!picking) return;
    picking = false;
    hovered = null;
    toast.hidden = true;
    document.removeEventListener("pointermove", onPointerMove, true);
    document.removeEventListener("pointerdown", swallow, true);
    document.removeEventListener("mousedown", swallow, true);
    document.removeEventListener("click", onClick, true);
    refresh();
    onChange(false);
  }

  return {
    start,
    stop,
    get picking() {
      return picking;
    },
    /** Outline an element while not picking (the open component, a hovered row); null hides it. */
    show(element) {
      shown = element;
      refresh();
    },
    /** Scroll an element into view and pulse its outline. */
    locate(element) {
      if (!element?.isConnected) return;
      element.scrollIntoView?.({ block: "center", behavior: "smooth" });
      shown = element;
      highlight.classList.remove("flash");
      void highlight.offsetWidth;
      highlight.classList.add("flash");
      setTimeout(refresh, 350);
    },
    refresh,
  };
}
