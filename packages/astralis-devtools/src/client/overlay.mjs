import { describeComponent, IDENTITY_ATTRIBUTE, readIdentity } from "./identity.mjs";
import { STYLES } from "./styles.mjs";

/* The Astralis DevTools overlay: a button in the corner of a page in
   development, and a panel with two tabs.

     Inspect   pick any Astralis component on the page, Server Components
               included, and see its name, the props it was given, how it
               reaches the browser, and its documentation
     Findings  the validator's findings for the project, live, with the
               files that render the current page first

   Plain DOM in a shadow root, so it needs no framework and the page's CSS
   cannot reach it. Everything from the page or the bridge goes in as text. */

const HOST_TAG = "astralis-devtools";
const ROUTE_POLL_MS = 1000;

const LOGO =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l2.4 7.1H22l-6.2 4.5 2.4 7.2L12 16.3l-6.2 4.5 2.4-7.2L2 9.1h7.6z" fill="#7c8cff"/></svg>';

/** h("div", { class: "row" }, "text", child): an element, with strings as text nodes. */
function h(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value === null || value === undefined) continue;
    if (name.startsWith("on") && typeof value === "function") element.addEventListener(name.slice(2), value);
    else element.setAttribute(name, value === true ? "" : String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    element.append(typeof child === "string" || typeof child === "number" ? String(child) : child);
  }
  return element;
}

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
const formatValue = (value) => (typeof value === "string" ? `"${value}"` : JSON.stringify(value));

/**
 * Mount the overlay on this page. Returns a function that removes it and
 * everything it listens to. Mounting twice is a no-op.
 */
export function mountOverlay({ base = "/api/astralis-devtools", framework = null } = {}) {
  if (typeof document === "undefined" || document.querySelector(HOST_TAG)) return () => {};

  const host = document.createElement(HOST_TAG);
  const shadow = host.attachShadow({ mode: "open" });
  shadow.append(h("style", {}, STYLES));

  const state = {
    open: false,
    tab: "inspect",
    picking: false,
    selected: null,
    spec: null,
    info: null,
    findings: null,
    bridge: "connecting", // connecting | live | unreachable
    route: location.pathname,
    routeFiles: [],
  };

  const cleanups = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  /* ---- launcher, panel, highlight ------------------------------------------ */

  const badge = h("span", { class: "badge", hidden: true });
  const launcher = h("button", {
    class: "launcher",
    type: "button",
    "aria-label": "Astralis DevTools",
    "aria-expanded": "false",
    title: "Astralis DevTools",
    onclick: () => setOpen(!state.open),
  });
  launcher.innerHTML = LOGO;
  launcher.append(badge);

  const body = h("div", { class: "body" });
  const tabButton = (id, label) =>
    h("button", { class: "tab", type: "button", role: "tab", "data-tab": id, onclick: () => setTab(id) }, label);
  const inspectTab = tabButton("inspect", "Inspect");
  const findingsTab = tabButton("findings", "Findings");
  const panel = h(
    "section",
    { class: "panel", role: "dialog", "aria-label": "Astralis DevTools", hidden: true },
    h(
      "header",
      {},
      h("h2", {}, "Astralis DevTools"),
      h("button", { class: "close", type: "button", "aria-label": "Close", onclick: () => setOpen(false) }, "×"),
    ),
    h("div", { class: "tabs", role: "tablist" }, inspectTab, findingsTab),
    body,
  );

  const highlightLabel = h("span", { class: "label" });
  const highlight = h("div", { class: "highlight", hidden: true }, highlightLabel);
  shadow.append(launcher, panel, highlight);
  document.body.append(host);

  /* ---- rendering ------------------------------------------------------------ */

  function setOpen(open) {
    state.open = open;
    if (!open) stopPicking();
    render();
    refreshHighlight();
  }

  function setTab(tab) {
    state.tab = tab;
    if (tab !== "inspect") stopPicking();
    render();
    refreshHighlight();
  }

  function renderBadge() {
    const findings = state.findings;
    const errors = findings?.errors ?? 0;
    const warnings = findings?.warnings ?? 0;
    badge.hidden = errors + warnings === 0;
    badge.className = errors > 0 ? "badge" : "badge warning";
    badge.textContent = String(errors > 0 ? errors : warnings);
    launcher.setAttribute(
      "aria-label",
      errors + warnings > 0
        ? `Astralis DevTools: ${plural(errors, "error")}, ${plural(warnings, "warning")}`
        : "Astralis DevTools",
    );
  }

  function render() {
    renderBadge();
    launcher.setAttribute("aria-expanded", String(state.open));
    panel.hidden = !state.open;
    inspectTab.setAttribute("aria-selected", String(state.tab === "inspect"));
    findingsTab.setAttribute("aria-selected", String(state.tab === "findings"));
    const errors = state.findings?.errors ?? 0;
    findingsTab.textContent = errors > 0 ? `Findings (${errors})` : "Findings";
    if (!state.open) return;
    body.replaceChildren(state.tab === "inspect" ? renderInspect() : renderFindings());
  }

  function renderInspect() {
    const pick = h(
      "button",
      { class: "primary", type: "button", "aria-pressed": String(state.picking), onclick: () => (state.picking ? stopPicking() : startPicking()) },
      state.picking ? "Picking… (Esc to stop)" : "Pick a component",
    );
    const intro = h(
      "p",
      { class: "muted" },
      state.picking ? "Hover the page and click an Astralis component." : "Select any Astralis component on the page, Server Components included.",
    );
    const selected = state.selected?.isConnected ? state.selected : null;
    if (!selected) return h("div", {}, h("div", { class: "row" }, pick), intro);

    const chain = readIdentity(selected);
    const placed = chain[0].name;
    const sections = chain.map(({ name, props }, index) => renderComponent(name, props, index === 0));

    const ancestors = [];
    for (let node = selected.parentElement?.closest(`[${IDENTITY_ATTRIBUTE}]`); node; node = node.parentElement?.closest(`[${IDENTITY_ATTRIBUTE}]`)) {
      ancestors.unshift(node);
    }
    const crumbs = ancestors.length
      ? h(
          "div",
          { class: "section" },
          h("h4", {}, "Inside"),
          h(
            "div",
            { class: "crumbs" },
            ancestors.map((node) =>
              h("button", { class: "crumb", type: "button", onclick: () => select(node) }, readIdentity(node)[0]?.name ?? "?"),
            ),
          ),
        )
      : null;

    return h(
      "div",
      {},
      h("div", { class: "row" }, pick),
      h(
        "div",
        { class: "component" },
        h("h3", {}, placed),
        chain.length > 1 ? h("p", { class: "chain" }, `renders through ${chain.slice(1).map((c) => c.name).join(" → ")}`) : null,
      ),
      sections,
      crumbs,
    );
  }

  function renderComponent(name, props, first) {
    const about = describeComponent(state.spec, name, framework);
    const entries = Object.entries(props);
    return h(
      "div",
      { class: "section" },
      h(
        "div",
        { class: "row" },
        first ? null : h("h4", { style: "margin:0" }, name),
        about.client ? h("span", { class: `pill ${about.client}`, title: about.clientDetail }, about.clientLabel) : null,
        h("a", { class: "link", href: about.docsUrl, target: "_blank", rel: "noreferrer" }, "Docs ↗"),
      ),
      about.client ? h("p", { class: "muted", style: "margin:6px 0 0" }, about.clientDetail) : null,
      state.spec && !about.known
        ? h(
            "p",
            { class: "muted" },
            about.partOf
              ? `Part of ${about.partOf}. The spec has no entry of its own for it, so no client tier is shown.`
              : `${name} is not in the installed spec.`,
          )
        : null,
      entries.length
        ? h(
            "table",
            { style: "margin-top:8px" },
            h("tbody", {}, entries.map(([key, value]) => h("tr", {}, h("td", {}, key), h("td", {}, formatValue(value))))),
          )
        : h("p", { class: "muted", style: "margin:6px 0 0" }, "No props beyond its defaults."),
    );
  }

  function renderFindings() {
    const findings = state.findings;
    if (state.bridge === "unreachable" && !findings) {
      return h(
        "div",
        { class: "notice" },
        h("p", { style: "margin-top:0" }, "The DevTools bridge is not answering at ", h("code", {}, base), "."),
        framework === "next"
          ? h(
              "p",
              { style: "margin-bottom:0" },
              "Add ",
              h("code", {}, "app/api/astralis-devtools/[...path]/route.ts"),
              " containing ",
              h("code", {}, 'export { GET } from "astralis-devtools/next/route";'),
              ", or run ",
              h("code", {}, "astralis init --devtools"),
              ".",
            )
          : h("p", { style: "margin-bottom:0" }, "Is the dev server running? The bridge answers this machine only."),
      );
    }
    if (!findings) return h("p", { class: "muted" }, "Validating the project…");
    if (findings.problem) return h("div", { class: "notice" }, findings.problem);

    const summary = h(
      "p",
      { class: "summary" },
      h("span", { class: findings.errors ? "count-error" : "clean" }, plural(findings.errors, "error")),
      ", ",
      h("span", { class: findings.warnings ? "count-warning" : "" }, plural(findings.warnings, "warning")),
      ` in ${plural(findings.files, "file")}`,
      state.info?.library ? h("span", { class: "muted" }, ` · astralis-ui ${state.info.library.version}`) : null,
      state.bridge === "unreachable" ? h("span", { class: "muted" }, " · reconnecting…") : null,
    );

    const byFile = new Map(findings.results.map((result) => [result.file, result]));
    const onPage = state.routeFiles;
    const pageSection = onPage.length
      ? h(
          "div",
          {},
          h("div", { class: "group-title" }, "This page"),
          onPage.some((file) => byFile.has(file))
            ? onPage.filter((file) => byFile.has(file)).map((file) => renderFile(byFile.get(file)))
            : h(
                "p",
                { class: "clean" },
                onPage.length === 1
                  ? "No findings in the file that renders this page."
                  : `No findings in the ${onPage.length} files that render this page.`,
              ),
        )
      : null;

    const rest = findings.results.filter((result) => !onPage.includes(result.file));
    const restSection = rest.length
      ? h("div", {}, onPage.length ? h("div", { class: "group-title" }, "Elsewhere in the project") : null, rest.map(renderFile))
      : findings.results.length === 0
        ? h("p", { class: "clean" }, "Every file conforms to the installed spec.")
        : null;

    return h("div", {}, summary, pageSection, restSection);
  }

  function renderFile(result) {
    const all = [
      ...result.errors.map((finding) => ({ ...finding, kind: "error" })),
      ...result.warnings.map((finding) => ({ ...finding, kind: "warning" })),
    ].sort((a, b) => a.line - b.line || a.column - b.column);
    return h(
      "div",
      { class: "file" },
      h("div", { class: "file-name" }, result.file),
      all.map((finding) =>
        h(
          "div",
          { class: `finding ${finding.kind}` },
          h("span", { class: "mark", "aria-label": finding.kind }, finding.kind === "error" ? "✗" : "!"),
          h("span", { class: "at" }, `${finding.line}:${finding.column}`),
          h("span", {}, finding.message, " ", h("code", {}, finding.code)),
        ),
      ),
    );
  }

  /* ---- picking -------------------------------------------------------------- */

  let hovered = null;

  const named = (target) => {
    if (!(target instanceof Element) || target === host || host.contains(target)) return null;
    return target.closest(`[${IDENTITY_ATTRIBUTE}]`);
  };

  function showHighlight(element) {
    if (!element?.isConnected) {
      highlight.hidden = true;
      return;
    }
    const rect = element.getBoundingClientRect();
    Object.assign(highlight.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    highlight.classList.toggle("below", rect.top < 24);
    highlightLabel.textContent = readIdentity(element).map((c) => c.name).join(" → ");
    highlight.hidden = false;
  }

  /** While picking, the hovered component; otherwise the selection, while the Inspect tab shows it. */
  const refreshHighlight = () =>
    showHighlight(state.picking ? hovered : state.open && state.tab === "inspect" ? state.selected : null);

  function onPointerMove(event) {
    hovered = named(event.target);
    refreshHighlight();
  }

  // The page must not react to the click that picks: no navigation, no menu.
  function swallow(event) {
    if (event.target === host) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function onPick(event) {
    if (event.target === host) return;
    swallow(event);
    const element = named(event.target);
    stopPicking();
    if (element) select(element);
  }

  function onKey(event) {
    if (event.key === "Escape" && state.picking) {
      event.preventDefault();
      stopPicking();
      render();
    }
  }

  function startPicking() {
    state.picking = true;
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerdown", swallow, true);
    document.addEventListener("mousedown", swallow, true);
    document.addEventListener("click", onPick, true);
    render();
  }

  function stopPicking() {
    if (!state.picking) return;
    state.picking = false;
    hovered = null;
    document.removeEventListener("pointermove", onPointerMove, true);
    document.removeEventListener("pointerdown", swallow, true);
    document.removeEventListener("mousedown", swallow, true);
    document.removeEventListener("click", onPick, true);
    refreshHighlight();
    render();
  }

  function select(element) {
    state.selected = element;
    state.tab = "inspect";
    state.open = true;
    render();
    refreshHighlight();
  }

  listen(document, "keydown", onKey, true);
  listen(window, "scroll", refreshHighlight, true);
  listen(window, "resize", refreshHighlight);
  cleanups.push(stopPicking);

  /* ---- the bridge ------------------------------------------------------------ */

  const getJson = (path) =>
    fetch(`${base}/${path}`, { cache: "no-store" }).then((response) => (response.ok ? response.json() : null));

  getJson("spec")
    .then((spec) => {
      if (spec?.components) {
        state.spec = spec;
        render();
      }
    })
    .catch(() => {});
  getJson("info")
    .then((info) => {
      if (info && !info.problem) {
        state.info = info;
        render();
      }
    })
    .catch(() => {});

  if (typeof EventSource !== "undefined") {
    const events = new EventSource(`${base}/events`);
    events.addEventListener("findings", (event) => {
      try {
        state.findings = JSON.parse(event.data);
        state.bridge = "live";
        render();
      } catch {
        // a malformed event changes nothing
      }
    });
    events.addEventListener("error", () => {
      state.bridge = "unreachable";
      render();
    });
    cleanups.push(() => events.close());
  }

  function loadRouteFiles() {
    if (framework !== "next") return;
    getJson(`route-files?path=${encodeURIComponent(state.route)}`)
      .then((result) => {
        if (result?.path === state.route) {
          state.routeFiles = result.files ?? [];
          render();
        }
      })
      .catch(() => {});
  }
  loadRouteFiles();
  // Client-side navigation changes the URL without an event to hook reliably.
  const routePoll = setInterval(() => {
    if (location.pathname !== state.route) {
      state.route = location.pathname;
      state.routeFiles = [];
      if (state.selected && !state.selected.isConnected) state.selected = null;
      loadRouteFiles();
      render();
    }
  }, ROUTE_POLL_MS);
  cleanups.push(() => clearInterval(routePoll));

  render();

  return () => {
    for (const cleanup of cleanups.splice(0)) cleanup();
    host.remove();
  };
}
