import { formatValue, h, icon, plural } from "../dom.mjs";
import { describeComponent, IDENTITY_ATTRIBUTE, readIdentity } from "../identity.mjs";
import { ICONS } from "../icons.mjs";
import { findingsFor } from "../page.mjs";
import { findingRow } from "./shared.mjs";

/* One component on the page: what it is, the props it was given, how it
   reaches the browser, where it sits, and the findings and recommendations
   about it. */

export function componentScreen(app, element) {
  const root = h("div", {});
  const chain = readIdentity(element);
  const name = chain[0]?.name ?? "Component";

  function propsCard(entry, first) {
    const about = describeComponent(app.state.spec, entry.name, app.framework);
    const props = Object.entries(entry.props);
    return h(
      "div",
      { class: "card pad" },
      h(
        "div",
        { class: "row", style: "margin-bottom:10px" },
        h("span", { class: "code grow", style: "font-weight:600" }, first ? "Props" : entry.name),
        h("a", { class: "link", href: about.docsUrl, target: "_blank", rel: "noreferrer" }, "Docs", icon(ICONS.external)),
      ),
      app.state.spec && !about.known
        ? h(
            "p",
            { class: "muted", style: "margin-bottom:8px" },
            about.partOf ? `Part of ${about.partOf}. The spec has no entry of its own for it, so no client tier is shown.` : `${entry.name} is not in the installed spec.`,
          )
        : null,
      props.length
        ? h("table", { class: "props" }, h("tbody", {}, props.map(([key, value]) => h("tr", {}, h("td", {}, key), h("td", {}, formatValue(value))))))
        : h("p", { class: "muted" }, "No props beyond its defaults."),
    );
  }

  function findingsSection(title, list, tone) {
    return h(
      "section",
      {},
      h("h3", { class: "section-title" }, title, h("span", { class: "n" }, String(list.length))),
      list.length
        ? h(
            "div",
            { class: "file-card" },
            list.map((finding) => findingRow(app, finding, { showFile: true, showComponent: false, exactLabel: finding.exact ? "This one" : null })),
          )
        : h("p", { class: "muted", style: "margin-bottom:4px" }, tone === "error" ? "Nothing broken here." : "Nothing to suggest."),
    );
  }

  function update() {
    const { state } = app;
    if (!element.isConnected) {
      root.replaceChildren(
        h("div", { class: "gone" }, icon(ICONS.findings), "This component has left the page."),
        h("button", { class: "btn", type: "button", onclick: () => app.navigate("components") }, icon(ICONS.back), "All components"),
      );
      return;
    }
    const about = describeComponent(state.spec, name, app.framework);
    const sameKind = state.instances.filter((i) => i.name === name);
    const instance = state.instances.find((i) => i.element === element) ?? { element, chain, name };
    const found = findingsFor(instance, state.findings, { routeFiles: state.routeFiles, alone: sameKind.length === 1 });
    const errors = found.filter((f) => f.kind === "error" && (f.exact || f.onPage));
    const warnings = found.filter((f) => f.kind === "warning" && (f.exact || f.onPage));

    const ancestors = [];
    for (let node = element.parentElement?.closest(`[${IDENTITY_ATTRIBUTE}]`); node; node = node.parentElement?.closest(`[${IDENTITY_ATTRIBUTE}]`)) {
      ancestors.unshift(node);
    }
    const inside = state.instances.filter((i) => i.element !== element && element.contains(i.element) && i.element.parentElement?.closest(`[${IDENTITY_ATTRIBUTE}]`) === element);

    const head = h(
      "div",
      { class: "detail-head" },
      h("span", { class: "detail-icon" }, icon(ICONS.components)),
      h(
        "div",
        { class: "grow" },
        h("h2", {}, name),
        chain.length > 1 ? h("p", { class: "chain" }, `renders through ${chain.slice(1).map((c) => c.name).join(" → ")}`) : null,
        h(
          "div",
          { class: "row" },
          about.client ? h("span", { class: `pill ${about.client}`, title: about.clientDetail }, h("i"), about.clientLabel) : null,
          about.category ? h("span", { class: "pill" }, about.category) : null,
          sameKind.length > 1 ? h("span", { class: "pill" }, `${sameKind.indexOf(instance) + 1} of ${sameKind.length} on this page`) : null,
          errors.length ? h("span", { class: "pill error" }, plural(errors.length, "finding")) : null,
          warnings.length ? h("span", { class: "pill advice" }, plural(warnings.length, "recommendation")) : null,
        ),
        about.client ? h("p", { class: "muted", style: "margin-top:8px;font-size:12.5px" }, about.clientDetail) : null,
      ),
    );

    const actions = h(
      "div",
      { class: "actions" },
      h("button", { class: "btn", type: "button", onclick: () => app.locate(element) }, icon(ICONS.locate), "Locate on page"),
      h("button", { class: "btn", type: "button", onclick: () => app.navigate("report") }, icon(ICONS.report), "Report a problem"),
      h("a", { class: "btn ghost", href: about.docsUrl, target: "_blank", rel: "noreferrer" }, "Docs", icon(ICONS.external)),
    );

    const crumbs = (title, nodes) =>
      nodes.length
        ? h(
            "section",
            {},
            h("h3", { class: "section-title" }, title),
            h(
              "div",
              { class: "tags" },
              nodes.map((node) =>
                h(
                  "button",
                  {
                    class: "chip",
                    type: "button",
                    onclick: () => app.openComponent(node),
                    onpointerenter: () => app.preview(node),
                    onpointerleave: () => app.preview(element),
                  },
                  readIdentity(node)[0]?.name ?? "?",
                ),
              ),
            ),
          )
        : null;

    root.replaceChildren(
      head,
      actions,
      h(
        "div",
        { class: "stack" },
        findingsSection("Findings", errors, "error"),
        findingsSection("Recommendations", warnings, "advice"),
        h("section", {}, h("h3", { class: "section-title" }, "Props"), h("div", { class: "stack" }, chain.map((entry, index) => propsCard(entry, index === 0)))),
        crumbs("Inside", ancestors),
        crumbs("Contains", inside.map((i) => i.element)),
      ),
    );
  }

  update();
  return { title: [{ label: "Components", screen: "components" }, { label: name, code: true }], root, update, element };
}
