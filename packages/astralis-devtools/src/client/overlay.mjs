import { describeComponent, IDENTITY_ATTRIBUTE, readIdentity } from "./identity.mjs";
import { browserEnvironment, captureScreenshot, recordConsoleErrors, treeFromElement } from "./report.mjs";
import { STYLES } from "./styles.mjs";

/* The Astralis DevTools overlay: a button in the corner of a page in
   development, and a panel with three tabs.

     Inspect   pick any Astralis component on the page, Server Components
               included, and see its name, the props it was given, how it
               reaches the browser, and its documentation
     Findings  the validator's findings for the project, live, with the
               files that render the current page first
     Report    an issue snapshot of the selected component: the exact JSON is
               shown before anything is sent, and nothing is sent until the
               reporter presses Send

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
    report: {
      title: "",
      happened: "",
      expected: "",
      includeText: false,
      includeFindings: true,
      includeConsole: false,
      screenshot: null,
      snapshot: null,
      problems: [],
      status: "idle", // idle | sending | sent | failed | notice
      message: "",
      url: null,
    },
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
  const reportTab = tabButton("report", "Report");
  const panel = h(
    "section",
    { class: "panel", role: "dialog", "aria-label": "Astralis DevTools", hidden: true },
    h(
      "header",
      {},
      h("h2", {}, "Astralis DevTools"),
      h("button", { class: "close", type: "button", "aria-label": "Close", onclick: () => setOpen(false) }, "×"),
    ),
    h("div", { class: "tabs", role: "tablist" }, inspectTab, findingsTab, reportTab),
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
    reportTab.setAttribute("aria-selected", String(state.tab === "report"));
    const errors = state.findings?.errors ?? 0;
    findingsTab.textContent = errors > 0 ? `Findings (${errors})` : "Findings";
    if (!state.open) return;
    if (state.tab === "report") {
      // The form keeps its input while findings stream in: rebuild it only for a new selection.
      const selected = state.selected?.isConnected ? state.selected : null;
      if (!reportView || reportView.element !== selected) {
        reportView = buildReportView(selected);
        body.replaceChildren(reportView.root);
        if (selected) scheduleSnapshot();
      }
      reportView.refresh();
      return;
    }
    reportView = null;
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
      h(
        "div",
        { class: "row" },
        pick,
        h("button", { class: "secondary", type: "button", onclick: () => setTab("report") }, "Report a problem here"),
      ),
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
              h("code", {}, 'export { GET, POST } from "astralis-devtools/next/route";'),
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

  /* ---- report ---------------------------------------------------------------- */

  let reportView = null;
  let snapshotTimer = null;
  let snapshotRequest = 0;
  const consoleErrors = recordConsoleErrors(window);
  cleanups.push(() => consoleErrors.stop());
  cleanups.push(() => clearTimeout(snapshotTimer));

  /** The JSON as shown: exact, except that a screenshot's data is summarised (it is shown as an image). */
  function previewText(snapshot) {
    if (!snapshot) return "";
    const shown = snapshot.screenshot
      ? { ...snapshot, screenshot: `data:image/jpeg;base64,… (${Math.round((snapshot.screenshot.length * 0.75) / 1024)} kB, shown above)` }
      : snapshot;
    return JSON.stringify(shown, null, 2);
  }

  function scheduleSnapshot() {
    clearTimeout(snapshotTimer);
    snapshotTimer = setTimeout(assembleSnapshot, 250);
  }

  /** Ask the bridge to complete the snapshot from the page's part. Nothing leaves the machine. */
  async function assembleSnapshot() {
    const selected = state.selected?.isConnected ? state.selected : null;
    if (!selected) return;
    const r = state.report;
    const request = ++snapshotRequest;
    const body = {
      tree: treeFromElement(selected, state.spec, { includeText: r.includeText, skip: host }),
      route: location.pathname,
      environment: browserEnvironment(window),
      description: { title: r.title, happened: r.happened, expected: r.expected },
      include: { findings: r.includeFindings, console: r.includeConsole, screenshot: Boolean(r.screenshot) },
      console: [...consoleErrors.messages],
      ...(r.screenshot ? { screenshot: r.screenshot } : {}),
    };
    try {
      const response = await fetch(`${base}/snapshot`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (request !== snapshotRequest) return; // a newer edit is on its way
      if (!response.ok) throw new Error(result?.error ?? `The bridge answered ${response.status}.`);
      r.snapshot = result.snapshot;
      r.problems = result.problems;
      if (r.status === "notice") r.status = "idle";
    } catch (error) {
      if (request !== snapshotRequest) return;
      r.snapshot = null;
      r.problems = [error.message];
    }
    reportView?.refresh();
  }

  async function sendReport() {
    const r = state.report;
    if (!r.snapshot || r.problems.length) return;
    r.status = "sending";
    r.message = "";
    reportView?.refresh();
    try {
      const response = await fetch(`${base}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(r.snapshot),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? `The bridge answered ${response.status}.`);
      r.status = "sent";
      r.url = result.url;
      window.open(result.url, "_blank", "noopener");
    } catch (error) {
      r.status = "failed";
      r.message = error.message;
    }
    reportView?.refresh();
  }

  function notice(message) {
    state.report.status = "notice";
    state.report.message = message;
    reportView?.refresh();
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(state.report.snapshot, null, 2));
      notice("Copied the snapshot's JSON.");
    } catch {
      notice("The browser did not allow copying; use Download instead.");
    }
  }

  function downloadReport() {
    const blob = new Blob([`${JSON.stringify(state.report.snapshot, null, 2)}\n`], { type: "application/json" });
    const link = h("a", { href: URL.createObjectURL(blob), download: "astralis-snapshot.json" });
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    notice("Saved astralis-snapshot.json.");
  }

  async function addScreenshot() {
    try {
      state.report.screenshot = await captureScreenshot({
        hide: () => (host.style.visibility = "hidden"),
        show: () => (host.style.visibility = ""),
      });
      scheduleSnapshot();
    } catch (error) {
      notice(error?.name === "NotAllowedError" ? "No screenshot: the capture was declined." : `No screenshot: ${error.message}`);
    }
    reportView?.refresh();
  }

  function buildReportView(selected) {
    if (!selected) {
      const root = h(
        "div",
        {},
        h("p", { class: "muted", style: "margin-top:0" }, "Pick the component the problem is in first; the report describes it and everything inside it."),
        h("button", { class: "primary", type: "button", onclick: () => { setTab("inspect"); startPicking(); } }, "Pick a component"),
      );
      return { element: null, root, refresh() {} };
    }
    const r = state.report;
    const field = (label, key, multiline) => {
      const input = h(multiline ? "textarea" : "input", {
        class: "field",
        rows: multiline ? 3 : null,
        maxlength: multiline ? 4000 : 200,
        "aria-label": label,
      });
      input.value = r[key];
      input.addEventListener("input", () => {
        r[key] = input.value;
        scheduleSnapshot();
      });
      return h("label", { class: "field-label" }, label, input);
    };
    const toggle = (label, key) => {
      const box = h("input", { type: "checkbox" });
      box.checked = r[key];
      box.addEventListener("change", () => {
        r[key] = box.checked;
        scheduleSnapshot();
      });
      const text = h("span", {}, label);
      return { row: h("label", { class: "toggle" }, box, text), text };
    };

    const textToggle = toggle("Include page text", "includeText");
    const findingsToggle = toggle("Include the validator's findings", "includeFindings");
    const consoleToggle = toggle("Include console errors", "includeConsole");
    const shot = h("div", { class: "shot" });
    const preview = h("pre", { class: "json", "aria-label": "Snapshot JSON" });
    const problems = h("ul", { class: "problems" });
    const status = h("p", { class: "status" });
    const send = h("button", { class: "primary", type: "button", onclick: sendReport }, "Send to the Astralis issue platform");
    const copy = h("button", { class: "secondary", type: "button", onclick: copyReport }, "Copy JSON");
    const download = h("button", { class: "secondary", type: "button", onclick: downloadReport }, "Download");

    const root = h(
      "div",
      { class: "report" },
      h("p", { class: "muted", style: "margin-top:0" }, `Reporting ${readIdentity(selected)[0]?.name ?? "this component"} and what it contains. Nothing is sent until you press Send.`),
      field("Title", "title", false),
      field("What happened?", "happened", true),
      field("What did you expect?", "expected", true),
      h("div", { class: "section" }, textToggle.row, findingsToggle.row, consoleToggle.row, shot),
      h("div", { class: "section" }, h("h4", {}, "Exactly what will be sent"), problems, preview),
      h("div", { class: "row actions" }, send, copy, download),
      status,
    );

    function refresh() {
      consoleToggle.text.textContent = `Include console errors (${consoleErrors.messages.length})`;
      shot.replaceChildren(
        r.screenshot
          ? h(
              "div",
              { class: "row" },
              h("img", { class: "thumb", src: r.screenshot, alt: "Screenshot to be sent" }),
              h("button", { class: "secondary", type: "button", onclick: () => { r.screenshot = null; scheduleSnapshot(); refresh(); } }, "Remove screenshot"),
            )
          : h("button", { class: "secondary", type: "button", onclick: addScreenshot }, "Add a screenshot…"),
      );
      preview.textContent = r.snapshot ? previewText(r.snapshot) : "Assembling…";
      problems.replaceChildren(...r.problems.map((p) => h("li", {}, p)));
      const blocked = !r.snapshot || r.problems.length > 0 || r.status === "sending";
      send.disabled = blocked;
      copy.disabled = !r.snapshot;
      download.disabled = !r.snapshot;
      send.textContent = r.status === "sending" ? "Sending…" : "Send to the Astralis issue platform";
      status.className = `status ${r.status}`;
      status.replaceChildren(
        r.status === "sent"
          ? h("span", {}, "Draft created. ", h("a", { class: "link", href: r.url, target: "_blank", rel: "noreferrer" }, "Open it"), " to sign in with GitHub and submit.")
          : r.status === "failed"
            ? `${r.message} Nothing was sent; Copy JSON or Download keeps the snapshot.`
            : r.status === "notice"
              ? r.message
              : "",
      );
    }

    return { element: selected, root, refresh };
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
        // An open report shows current findings, not the ones from when it was opened.
        if (state.open && state.tab === "report") scheduleSnapshot();
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
