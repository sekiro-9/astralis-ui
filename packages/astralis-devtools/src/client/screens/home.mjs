import { countUp, h, icon, plural } from "../dom.mjs";
import { ICONS, MARK } from "../icons.mjs";

/* Home: what the DevTools sees on this page, at a glance, with a way into
   each of the other screens. */

const FRAMEWORKS = { next: "Next.js", vite: "Vite" };

export function homeScreen(app) {
  const meta = h("p", {});
  const tiles = h("div", { class: "tiles" });

  const tile = (screen, iconMarkup, label, withValue) => {
    const value = withValue ? h("div", { class: "tile-value" }, "–") : null;
    const sub = h("div", { class: "tile-sub" });
    const element = h(
      "button",
      { class: "tile", type: "button", "data-screen": screen, onclick: () => app.navigate(screen) },
      h("div", { class: "tile-head" }, h("span", { class: "tile-icon" }, icon(iconMarkup)), icon(ICONS.arrow, "icon tile-arrow")),
      h("div", {}, value, h("div", { class: "tile-label" }, label), sub),
    );
    // The card's glow follows the pointer.
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      element.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
    tiles.append(element);
    let shown = null;
    return {
      set(number, text, tone = "") {
        element.className = `tile ${tone}`.trim();
        sub.textContent = text;
        if (!value) return;
        if (typeof number !== "number") value.textContent = "–";
        else if (shown === null) countUp(value, number);
        else value.textContent = String(number);
        shown = typeof number === "number" ? number : null;
      },
    };
  };
  const components = tile("components", ICONS.components, "Components", true);
  const errorsTile = tile("findings", ICONS.findings, "Findings", true);
  const warningsTile = tile("recommendations", ICONS.recommendations, "Recommendations", true);
  const reportTile = tile("report", ICONS.report, "Report a problem", false);
  reportTile.set(null, "Send a snapshot of a component");

  function update() {
    const { state } = app;
    const info = state.info;
    const framework = info?.framework?.name ?? app.framework;
    meta.textContent = [
      info?.library ? `astralis-ui ${info.library.version}` : "astralis-ui",
      framework ? `${FRAMEWORKS[framework] ?? framework}${info?.framework?.version ? ` ${info.framework.version}` : ""}` : null,
      info?.react ? `React ${info.react}` : null,
    ]
      .filter(Boolean)
      .join("  ·  ");

    const kinds = new Set(state.instances.map((i) => i.name)).size;
    components.set(state.instances.length, state.instances.length ? `${plural(kinds, "kind")} on this page` : "None on this page yet");

    const findings = state.findings;
    if (!findings || findings.problem) {
      const text = findings?.problem ? "Unavailable" : state.bridge === "unreachable" ? "Bridge not answering" : "Validating…";
      errorsTile.set(null, text);
      warningsTile.set(null, text);
    } else {
      const withErrors = findings.results.filter((r) => r.errors.length).length;
      const withWarnings = findings.results.filter((r) => r.warnings.length).length;
      errorsTile.set(findings.errors, findings.errors ? `in ${withErrors} of ${plural(findings.files, "file")}` : "Nothing broken", findings.errors ? "error" : "clean");
      warningsTile.set(findings.warnings, findings.warnings ? `in ${withWarnings} of ${plural(findings.files, "file")}` : "Nothing to suggest", findings.warnings ? "advice" : "clean");
    }
  }

  const mark = h("div", { class: "hero-mark" });
  mark.innerHTML = MARK;
  const root = h(
    "div",
    {},
    h("div", { class: "hero" }, mark, h("div", {}, h("h1", {}, "Astralis ", h("span", {}, "DevTools")), meta)),
    tiles,
    h(
      "div",
      { class: "shortcuts" },
      h("span", { class: "shortcut" }, h("span", { class: "kbd" }, "Shift"), h("span", { class: "kbd" }, "Alt"), h("span", { class: "kbd" }, "A"), h("span", {}, "Open or close")),
      h("span", { class: "shortcut" }, h("span", { class: "kbd" }, "Shift"), h("span", { class: "kbd" }, "Alt"), h("span", { class: "kbd" }, "C"), h("span", {}, "Pick a component")),
    ),
  );
  update();
  return { title: [{ label: "Home" }], root, update };
}
