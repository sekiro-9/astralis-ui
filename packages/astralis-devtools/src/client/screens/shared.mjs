import { filePath, h, icon } from "../dom.mjs";
import { ICONS } from "../icons.mjs";

/* Pieces more than one screen draws. */

/**
 * One finding: where it is, what is wrong, and the component it is on. The
 * component is a link to that component on the page when the page has it.
 */
export function findingRow(app, finding, { showFile = false, exactLabel = null, showComponent = true } = {}) {
  const target = finding.component ? app.instanceFor(finding) : null;
  const component = finding.component && showComponent
    ? target
      ? h("button", { class: "chip", type: "button", title: "Inspect it on the page", onclick: () => app.openComponent(target.element) }, finding.component, icon(ICONS.chevron))
      : h("span", { class: "chip", title: "Not on this page" }, finding.component)
    : null;
  return h(
    "div",
    { class: `finding ${finding.kind}` },
    h("span", { class: "at" }, `${finding.line}:${finding.column}`),
    h("span", { class: "message" }, finding.message),
    h(
      "div",
      { class: "meta" },
      exactLabel ? h("span", { class: "chip exact" }, icon(ICONS.check), exactLabel) : null,
      component,
      showFile ? h("span", { class: "chip" }, filePath(finding.file)) : null,
      h("span", { class: "rule" }, finding.code),
    ),
  );
}

/** A friendly empty state. */
export function empty(iconMarkup, title, text, { neutral = false } = {}) {
  return h("div", { class: `empty${neutral ? " neutral" : ""}` }, icon(iconMarkup), h("h3", {}, title), text ? h("p", {}, text) : null);
}

/** The bridge cannot be reached: say what to add, for the framework in use. */
export function bridgeMissing(app) {
  const { base, framework } = app;
  return h(
    "div",
    { class: "notice" },
    h("p", { style: "margin-bottom:8px" }, "The DevTools bridge is not answering at ", h("code", {}, base), "."),
    framework === "next"
      ? h(
          "p",
          {},
          "Add ",
          h("code", {}, "app/api/astralis-devtools/[...path]/route.ts"),
          " containing ",
          h("code", {}, 'export { GET, POST } from "astralis-devtools/next/route";'),
          ", or run ",
          h("code", {}, "astralis init --devtools"),
          ".",
        )
      : h("p", {}, "Is the dev server running? The bridge answers this machine only."),
  );
}
