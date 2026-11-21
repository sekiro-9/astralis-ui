import { contentOf } from "astralis-cli/snapshot";
import { formatValue, h, icon } from "../dom.mjs";
import { ICONS } from "../icons.mjs";
import { filterProps, propsModel } from "../props.mjs";

/* Every prop a component takes, from the spec, with a search over names and
   values. The first section is open; each other group opens on demand and is
   drawn only then, so a Box's hundred props cost nothing until asked for. */

/** How many values a row shows before "+N more". */
const SHOWN_VALUES = 8;

const ARBITRARY = { length: "any length", color: "any colour", shadow: "any shadow", number: "any number", integer: "any whole number" };

/**
 * The components on the element the page itself wrote: "Modal.Trigger Button"
 * is both (a Trigger takes one element), "Heading Text" is only the Heading.
 */
function written(spec, chain) {
  let end = 1;
  while (end < chain.length && contentOf(spec, chain[end - 1].name) === "element") end++;
  return chain.slice(0, end);
}

export function allProps(app, chain) {
  const input = h("input", { type: "search", placeholder: "Search props or values", "aria-label": "Search props or values", autocomplete: "off", spellcheck: "false" });
  const search = h("label", { class: "search" }, icon(ICONS.search), input);
  const which = h("div", { class: "segmented", role: "group", "aria-label": "Component", style: "margin:0 0 10px" });
  const body = h("div", { class: "prop-groups" });
  const count = h("span", { class: "n" });
  const root = h("section", {}, h("h3", { class: "section-title" }, "Props it takes", count), which, search, body);

  const opened = new Map(); // section id -> open, once the reader has toggled it
  const moreShown = new Set(); // rows whose whole value list the reader opened, by section and name
  let chosen = 0;
  let spec = null;
  let mine = chain.slice(0, 1);
  let model = null;
  let query = "";

  input.addEventListener("input", () => {
    query = input.value;
    draw();
  });

  function valueList(section, row) {
    const id = `${section.id}/${row.name}`;
    const all = row.byValue || moreShown.has(id) || row.values.length <= SHOWN_VALUES + 1;
    const shown = all ? row.values : row.values.slice(0, SHOWN_VALUES);
    const usedValue = row.used && typeof row.used.value !== "object" ? String(row.used.value) : null;
    const q = query.trim().toLowerCase();
    const parts = shown.map((value) =>
      h("span", { class: `val${value === usedValue ? " on" : ""}${row.byValue && q && value.toLowerCase().includes(q) ? " hit" : ""}` }, value),
    );
    if (!all) {
      parts.push(
        h(
          "button",
          {
            class: "val more",
            type: "button",
            "aria-label": `Show all ${row.values.length} values of ${row.name}`,
            onclick: (event) => {
              moreShown.add(id);
              const list = valueList(section, row);
              list.tabIndex = -1;
              event.currentTarget.closest(".prop-values").replaceWith(list);
              list.focus();
            },
          },
          `+${row.values.length - SHOWN_VALUES} more`,
        ),
      );
    }
    if (row.arbitrary) parts.push(h("span", { class: "faint" }, `or ${ARBITRARY[row.arbitrary] ?? `any ${row.arbitrary}`}`));
    return h("div", { class: "prop-values" }, parts);
  }

  function rowView(section, row) {
    return h(
      "div",
      { class: `prop-row${row.used ? " used" : ""}`, role: "listitem" },
      h(
        "div",
        { class: "prop-head" },
        h("span", { class: "prop-name" }, row.name),
        row.aliases.length ? h("span", { class: "prop-alias" }, row.aliases.join(", ")) : null,
        row.type && !row.values.length ? h("span", { class: "prop-type" }, row.type) : null,
        row.required ? h("span", { class: "pill error" }, "Required") : null,
        row.used ? h("span", { class: "pill in-use", title: `This one has ${row.used.as}=${formatValue(row.used.value)}` }, `In use: ${formatValue(row.used.value)}`) : null,
      ),
      row.description ? h("p", { class: "prop-doc" }, row.description) : null,
      row.default ? h("p", { class: "prop-default" }, "Default: ", h("span", { class: "code" }, row.default)) : null,
      row.note ? h("p", { class: "prop-doc faint" }, row.note) : null,
      row.values.length || row.arbitrary ? valueList(section, row) : null,
    );
  }

  /** The first section starts open (its own props, or its first group); the rest wait to be asked for. */
  function sectionView(section, first, searching) {
    const expanded = searching || (opened.get(section.id) ?? first);
    const used = section.rows.filter((row) => row.used).length;
    const rows = h("div", { class: "prop-rows", role: "list" });
    const fill = () => rows.childElementCount || rows.append(...section.rows.map((row) => rowView(section, row)));
    if (expanded) fill();
    const wrap = h("div", { class: "group prop-group", "data-open": String(expanded) });
    // A closed group only looks empty: inert keeps its rows out of the tab order too.
    const body = h("div", { class: "instances", inert: !expanded }, h("div", {}, rows));
    const head = h(
      "button",
      {
        class: "group-row",
        type: "button",
        "aria-expanded": String(expanded),
        onclick: () => {
          const now = wrap.dataset.open !== "true";
          opened.set(section.id, now);
          if (now) fill();
          head.setAttribute("aria-expanded", String(now));
          wrap.dataset.open = String(now);
          body.inert = !now;
        },
      },
      icon(ICONS.chevron, "icon chev"),
      h("span", { class: "group-label" }, section.label),
      h("span", { class: "group-hint grow" }, section.inferred ? "listed by the spec outside its groups" : section.hint),
      used ? h("span", { class: "mini in-use", title: `${used} in use here` }, h("i"), `${used} in use`) : null,
      h("span", { class: "n-pill" }, String(section.rows.length)),
    );
    wrap.append(head, body);
    return wrap;
  }

  function draw() {
    which.hidden = mine.length < 2;
    which.replaceChildren(
      ...mine.map(({ name }, index) =>
        h(
          "button",
          {
            type: "button",
            "aria-pressed": String(index === chosen),
            onclick: () => {
              if (index === chosen) return;
              chosen = index;
              model = null;
              draw();
            },
          },
          name,
        ),
      ),
    );
    if (!spec) {
      count.textContent = "";
      search.hidden = true;
      body.replaceChildren(h("div", { class: "skeleton", style: "width:60%" }));
      return;
    }
    model ??= propsModel(spec, mine[chosen].name, mine[chosen].props);
    if (!model) {
      count.textContent = "";
      search.hidden = true;
      body.replaceChildren(h("p", { class: "muted" }, `${mine[chosen].name} is not in the installed spec, so its props cannot be listed.`));
      return;
    }
    search.hidden = false;
    const searching = Boolean(query.trim());
    const found = filterProps(model, query);
    count.textContent = searching ? `${found.count} of ${model.total}` : String(model.total);
    body.replaceChildren(
      ...(found.sections.length
        ? found.sections.map((section, index) => sectionView(section, index === 0, searching))
        : [h("p", { class: "muted" }, model.total ? `No prop or value matches "${query.trim()}".` : "It takes no props the spec describes.")]),
    );
  }

  draw();
  return {
    root,
    /** Redraw when the spec arrives or changes; the search and what is open are kept. */
    update() {
      if (app.state.spec === spec) return;
      spec = app.state.spec;
      mine = spec ? written(spec, chain) : chain.slice(0, 1);
      chosen = Math.min(chosen, mine.length - 1);
      model = null;
      draw();
    },
    input,
  };
}
