/* Small DOM helpers the overlay's screens share. Everything that comes from
   the page or the bridge goes in as text: only the overlay's own icons are
   markup. */

/** h("div", { class: "row" }, "text", child): an element, with strings as text nodes. */
export function h(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value === null || value === undefined) continue;
    if (name.startsWith("on") && typeof value === "function") element.addEventListener(name.slice(2), value);
    else element.setAttribute(name, value === true ? "" : String(value));
  }
  append(element, children);
  return element;
}

function append(element, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    element.append(typeof child === "string" || typeof child === "number" ? String(child) : child);
  }
}

/** An icon from icons.mjs: the overlay's own markup, never the page's. */
export function icon(markup, className = "icon") {
  const span = document.createElement("span");
  span.className = className;
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = markup;
  return span;
}

export const plural = (count, word, many = `${word}s`) => `${count} ${count === 1 ? word : many}`;

export const formatValue = (value) => (typeof value === "string" ? `"${value}"` : JSON.stringify(value));

export const reducedMotion = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Run a Web Animation where the browser has one and motion is welcome. */
export function animate(element, keyframes, options) {
  if (typeof element.animate !== "function" || reducedMotion()) return null;
  return element.animate(keyframes, options);
}

/** Count a number up into `element` the first time it is shown. */
export function countUp(element, to, duration = 520) {
  element.textContent = String(to);
  if (to <= 0 || reducedMotion() || typeof requestAnimationFrame !== "function") return;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    element.textContent = String(Math.round(to * (1 - (1 - t) ** 3)));
    if (t < 1 && element.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** A file path split for display: the directory muted, the name bright. */
export function filePath(path, extra = null) {
  const cut = path.lastIndexOf("/") + 1;
  return h("span", { class: "path", title: path }, h("span", { class: "dir" }, path.slice(0, cut)), h("span", { class: "base" }, path.slice(cut)), extra);
}

const STORE = "astralis-devtools";

/** Per-viewer conveniences (where the launcher sits, whether the panel was open). Never required. */
export const store = {
  read(storage, key) {
    try {
      return JSON.parse(globalThis[storage]?.getItem(`${STORE}:${key}`) ?? "null");
    } catch {
      return null;
    }
  },
  write(storage, key, value) {
    try {
      globalThis[storage]?.setItem(`${STORE}:${key}`, JSON.stringify(value));
    } catch {
      // private mode or blocked storage: the overlay works without it
    }
  },
};
