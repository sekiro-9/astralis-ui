import { h, icon, plural } from "../dom.mjs";
import { describeComponent } from "../identity.mjs";
import { ICONS } from "../icons.mjs";
import { findingsForGroup, groupByComponent, instanceLabel } from "../page.mjs";
import { empty } from "./shared.mjs";

/* Components: every astralis-ui component on the page, grouped by what it is.
   Hovering an instance outlines it on the page; choosing one opens its page. */

export function componentsScreen(app) {
  const input = h("input", { type: "search", placeholder: "Filter components", "aria-label": "Filter components", autocomplete: "off", spellcheck: "false" });
  const list = h("div", { class: "list", role: "list" });
  const open = new Set(); // groups the reader expanded
  let query = "";

  input.addEventListener("input", () => {
    query = input.value.trim().toLowerCase();
    update();
  });

  function groupView(group) {
    const { state } = app;
    const about = describeComponent(state.spec, group.name, app.framework);
    const counts = findingsForGroup(group, state.findings, state.routeFiles);
    const single = group.instances.length === 1;
    const expanded = open.has(group.name) || (query && group.instances.length <= 6);

    const row = h(
      "button",
      {
        class: "group-row",
        type: "button",
        "aria-expanded": single ? null : String(Boolean(expanded)),
        onclick: (event) => {
          if (single) return app.openComponent(group.instances[0].element);
          // Toggled in place, so the instances slide open rather than appear.
          const now = !open.has(group.name);
          if (now) open.add(group.name);
          else open.delete(group.name);
          event.currentTarget.setAttribute("aria-expanded", String(now));
          event.currentTarget.parentElement.dataset.open = String(now);
        },
        onpointerenter: () => single && app.preview(group.instances[0].element),
        onpointerleave: () => single && app.preview(null),
      },
      icon(ICONS.chevron, "icon chev"),
      h("span", { class: `tier-dot ${about.client ?? ""}`, title: about.clientLabel ?? "" }),
      h("span", { class: "name grow" }, group.name),
      counts.errors ? h("span", { class: "mini error", title: plural(counts.errors, "finding") }, h("i"), String(counts.errors)) : null,
      counts.warnings ? h("span", { class: "mini advice", title: plural(counts.warnings, "recommendation") }, h("i"), String(counts.warnings)) : null,
      h("span", { class: "n-pill" }, String(group.instances.length)),
    );

    const instances = single
      ? null
      : h(
          "div",
          { class: "instances" },
          h(
            "div",
            {},
            h(
              "div",
              { class: "list" },
              group.instances.map((instance, index) => {
                const { text, props } = instanceLabel(instance);
                return h(
                  "button",
                  {
                    class: "instance-row",
                    type: "button",
                    onclick: () => app.openComponent(instance.element),
                    onpointerenter: () => app.preview(instance.element),
                    onpointerleave: () => app.preview(null),
                  },
                  h("span", { class: "idx" }, `#${index + 1}`),
                  text ? h("span", { class: "text" }, text) : null,
                  h("span", { class: "props grow" }, props),
                  icon(ICONS.arrow, "icon go"),
                );
              }),
            ),
          ),
        );
    return h("div", { class: "group", role: "listitem", "data-open": String(Boolean(expanded) && !single) }, row, instances);
  }

  function update() {
    const { state } = app;
    if (!state.instances.length) {
      list.replaceChildren(
        empty(ICONS.components, "No components on this page", "Components from astralis-ui show up here as they render, Server Components included.", { neutral: true }),
      );
      return;
    }
    const groups = groupByComponent(state.instances).filter((g) => !query || g.name.toLowerCase().includes(query));
    list.replaceChildren(
      ...(groups.length ? groups.map(groupView) : [empty(ICONS.search, "No matches", `Nothing on this page is called “${input.value}”.`, { neutral: true })]),
    );
  }

  const root = h(
    "div",
    {},
    h("label", { class: "search" }, icon(ICONS.search), input),
    list,
    h(
      "div",
      { class: "legend" },
      h("span", {}, h("span", { class: "tier-dot none" }), "Server Component"),
      h("span", {}, h("span", { class: "tier-dot leaf" }), "Server shell, client island"),
      h("span", {}, h("span", { class: "tier-dot required" }), "Client Component"),
    ),
  );
  update();
  return { title: [{ label: "Components" }], root, update, focus: () => input.focus({ preventScroll: true }) };
}
