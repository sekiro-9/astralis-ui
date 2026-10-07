import { animate, h, icon, store } from "./dom.mjs";
import { FONT_FACES } from "./fonts.mjs";
import { ICONS, MARK } from "./icons.mjs";
import { createLauncher } from "./launcher.mjs";
import { scanPage } from "./page.mjs";
import { createPicker } from "./picker.mjs";
import { recordConsoleErrors } from "./report.mjs";
import { componentScreen } from "./screens/component.mjs";
import { componentsScreen } from "./screens/components.mjs";
import { findingsScreen } from "./screens/findings.mjs";
import { homeScreen } from "./screens/home.mjs";
import { reportScreen } from "./screens/report.mjs";
import { STYLES } from "./styles.mjs";

/* The Astralis DevTools overlay: a launcher that can sit anywhere on the
   page in development, and a panel with five screens.

     Home             what is on this page, at a glance
     Components       every astralis-ui component on the page; each opens a
                      page of its own with its props, how it reaches the
                      browser, and the findings about it
     Findings         the validator's errors, live: what renders wrong
     Recommendations  the validator's warnings: what works but could be better
     Report           an issue snapshot of one component, shown in full before
                      anything is sent

   Shift+Alt+A opens and closes it. Shift+Alt+C picks a component on the page
   and opens its page. Plain DOM in a shadow root, so it needs no framework and
   the page's CSS cannot reach it. Everything from the page or the bridge goes
   in as text. */

const HOST_TAG = "astralis-devtools";
const FONTS_ID = "astralis-devtools-fonts";
const ROUTE_POLL_MS = 1000;
const SCAN_DEBOUNCE_MS = 200;
const PANEL_GAP = 10;
const EDGE = 12;

const NAV = [
  { screen: "home", label: "Home", icon: ICONS.home },
  { screen: "components", label: "Components", icon: ICONS.components },
  { screen: "findings", label: "Findings", icon: ICONS.findings },
  { screen: "recommendations", label: "Recommendations", icon: ICONS.recommendations },
  { screen: "report", label: "Report", icon: ICONS.report },
];

const SHORTCUTS = { open: "KeyA", pick: "KeyC" };

/**
 * Mount the overlay on this page. Returns a function that removes it and
 * everything it listens to. Mounting twice is a no-op.
 */
export function mountOverlay({ base = "/api/astralis-devtools", framework = null } = {}) {
  if (typeof document === "undefined" || document.querySelector(HOST_TAG)) return () => {};

  const host = document.createElement(HOST_TAG);
  const shadow = host.attachShadow({ mode: "open" });
  shadow.append(h("style", {}, STYLES));

  // @font-face is ignored inside a shadow root, so the faces go on the document, under names no page uses.
  let fonts = document.getElementById(FONTS_ID);
  const ownFonts = !fonts;
  if (ownFonts) {
    fonts = h("style", { id: FONTS_ID }, FONT_FACES);
    document.head.append(fonts);
  }

  const remembered = store.read("sessionStorage", "panel") ?? {};
  const state = {
    open: false,
    screen: NAV.some((n) => n.screen === remembered.screen) ? remembered.screen : "home",
    selected: null,
    spec: null,
    info: null,
    findings: null,
    bridge: "connecting", // connecting | live | unreachable
    route: location.pathname,
    routeFiles: [],
    instances: [],
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

  /* ---- the panel's frame ------------------------------------------------------ */

  const indicator = h("span", { class: "nav-indicator" });
  const navButtons = new Map();
  for (const item of NAV) {
    navButtons.set(
      item.screen,
      h(
        "button",
        { class: "nav-button", type: "button", "data-screen": item.screen, "aria-label": item.label, onclick: () => navigate(item.screen) },
        icon(item.icon),
        h("span", { class: "count", hidden: true }),
        h("span", { class: "tip", "aria-hidden": "true" }, item.label),
      ),
    );
  }
  const brand = h("button", { class: "brand", type: "button", "aria-label": "Home", onclick: () => navigate("home") }, icon(MARK));
  const sidebarPick = h(
    "button",
    { class: "nav-button", type: "button", "aria-label": "Pick a component", "aria-pressed": "false", onclick: () => startPicking() },
    icon(ICONS.pick),
    h("span", { class: "tip", "aria-hidden": "true" }, "Pick a component"),
  );
  const sidebar = h(
    "nav",
    { class: "sidebar", "aria-label": "DevTools" },
    brand,
    h("div", { class: "nav" }, indicator, [...navButtons.values()]),
    h("div", { class: "sidebar-end" }, sidebarPick),
  );
  const crumbs = h("div", { class: "crumbs" });
  const statusSlot = h("span", {});
  const closeButton = h("button", { class: "icon-button close", type: "button", "aria-label": "Close", title: "Close (Shift+Alt+A)", onclick: () => setOpen(false) }, icon(ICONS.close));
  const view = h("div", { class: "view" });
  const panel = h(
    "section",
    { class: "panel", role: "dialog", "aria-label": "Astralis DevTools", "data-open": "false", inert: true },
    sidebar,
    h("div", { class: "main" }, h("header", { class: "topbar" }, crumbs, statusSlot, closeButton), view),
  );

  const launcher = createLauncher({
    onToggle: () => setOpen(!state.open),
    onPick: () => (picker.picking ? picker.stop() : startPicking()),
    onMove: () => state.open && placePanel(),
  });

  const picker = createPicker({
    host,
    shadow,
    onPicked: (element) => {
      state.selected = element;
      const back = pickReturn;
      pickReturn = null;
      navigate(back ?? "component", { open: true });
    },
    onChange: (picking) => {
      // The panel steps aside while picking, so the whole page can be pointed at.
      showPanel(state.open && !picking);
      launcher.setPicking(picking);
      sidebarPick.setAttribute("aria-pressed", String(picking));
    },
  });
  let pickReturn = null; // the screen to go back to after a pick, set by every start

  shadow.append(panel, launcher.element);
  document.body.append(host);
  launcher.layout();

  /* ---- what the screens can do ---------------------------------------------------- */

  const consoleErrors = recordConsoleErrors(window);
  cleanups.push(() => consoleErrors.stop());

  const app = {
    state,
    base,
    framework,
    host,
    consoleErrors,
    navigate: (screen) => navigate(screen),
    openComponent(element) {
      state.selected = element;
      navigate("component", { open: true });
    },
    startPicking: (returnTo) => startPicking(returnTo),
    /** Outline an element on the page while the reader points at its row; null restores the default. */
    preview: (element) => picker.show(element ?? defaultOutline()),
    locate: (element) => picker.locate(element),
    /** The instance on the page a finding is most likely about, if the page has one. */
    instanceFor(finding) {
      const same = state.instances.filter((i) => i.chain.some((c) => c.name === finding.component));
      const exact = same.find((i) => {
        const props = i.chain.find((c) => c.name === finding.component)?.props ?? {};
        return finding.prop !== undefined && finding.prop in props && String(props[finding.prop]) === String(finding.value);
      });
      return exact ?? same[0] ?? null;
    },
    statusPill() {
      const label = { live: "Validator live", connecting: "Connecting…", unreachable: "Bridge offline" }[state.bridge];
      return h("span", { class: `status ${state.bridge}`, title: `DevTools bridge at ${base}` }, h("i"), label);
    },
  };

  /* ---- screens -------------------------------------------------------------------- */

  let current = null; // { screen, title, root, update, dispose?, element? }

  function build(screen) {
    switch (screen) {
      case "components":
        return componentsScreen(app);
      case "findings":
      case "recommendations":
        return findingsScreen(app, screen);
      case "report":
        return reportScreen(app);
      case "component":
        return state.selected ? componentScreen(app, state.selected) : componentsScreen(app);
      default:
        return homeScreen(app);
    }
  }

  function navigate(screen, { open = false } = {}) {
    if (screen === "component" && !state.selected) screen = "components";
    current?.dispose?.();
    state.screen = screen;
    current = { screen, ...build(screen) };
    view.replaceChildren(current.root);
    view.scrollTop = 0;
    animate(current.root, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    renderFrame();
    remember();
    if (open && !state.open) setOpen(true);
    picker.show(defaultOutline());
    if (state.open) current.focus?.();
  }

  /** The selection stays outlined while its page is open. */
  const defaultOutline = () => (state.open && current?.screen === "component" ? current.element : null);

  function renderFrame() {
    const active = state.screen === "component" ? "components" : state.screen;
    const index = NAV.findIndex((n) => n.screen === active);
    for (const [screen, button] of navButtons) {
      if (screen === active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
    indicator.style.transform = `translateY(${index * 44}px)`;

    const findings = state.findings && !state.findings.problem ? state.findings : null;
    const errors = findings?.errors ?? 0;
    const warnings = findings?.warnings ?? 0;
    const setCount = (screen, n, tone) => {
      const badge = navButtons.get(screen).querySelector(".count");
      badge.hidden = n === 0;
      badge.className = `count ${tone}`;
      badge.textContent = n > 99 ? "99+" : String(n);
    };
    setCount("findings", errors, "");
    setCount("recommendations", warnings, "advice");
    launcher.setCounts({ errors, warnings });

    crumbs.replaceChildren(
      ...(current?.title ?? []).flatMap((part, i, all) => {
        const last = i === all.length - 1;
        const node = last
          ? h("span", { class: `crumb-current${part.code ? " code" : ""}` }, part.label)
          : h("button", { class: "crumb-link", type: "button", onclick: () => navigate(part.screen) }, part.label);
        return last ? [node] : [node, icon(ICONS.chevron)];
      }),
    );
    statusSlot.replaceChildren(app.statusPill());
  }

  /** Data changed: redraw the frame and let the screen bring itself up to date. */
  function refresh(reason) {
    renderFrame();
    current?.update(reason);
  }

  function remember() {
    store.write("sessionStorage", "panel", { open: state.open, screen: state.screen === "component" ? "components" : state.screen });
  }

  /* ---- opening, and where the panel sits ------------------------------------------ */

  /** Above or below the launcher, centred on it near the middle, else on the side with room; always on screen. */
  function placePanel() {
    const anchor = launcher.rect();
    const width = panel.offsetWidth || Math.min(640, window.innerWidth - 24);
    const height = panel.offsetHeight || Math.min(560, window.innerHeight - 24);
    const centre = anchor.left + anchor.width / 2;
    const middle = Math.abs(centre - window.innerWidth / 2) < window.innerWidth * 0.15;
    const right = centre > window.innerWidth / 2;
    const below = anchor.top + anchor.height / 2 < window.innerHeight / 2;
    let x = middle ? centre - width / 2 : right ? anchor.right - width : anchor.left;
    let y = below ? anchor.bottom + PANEL_GAP : anchor.top - PANEL_GAP - height;
    x = Math.min(window.innerWidth - width - EDGE, Math.max(EDGE, x));
    y = Math.min(window.innerHeight - height - EDGE, Math.max(EDGE, y));
    panel.style.left = `${Math.round(x)}px`;
    panel.style.top = `${Math.round(y)}px`;
    panel.style.transformOrigin = `${middle ? "center" : right ? "right" : "left"} ${below ? "top" : "bottom"}`;
  }

  function showPanel(visible) {
    panel.dataset.open = String(visible);
    panel.toggleAttribute("inert", !visible);
  }

  function setOpen(open) {
    state.open = open;
    if (open) placePanel();
    showPanel(open && !picker.picking);
    launcher.setOpen(open);
    picker.show(defaultOutline());
    remember();
    if (open) current?.focus?.();
  }

  function startPicking(returnTo = null) {
    pickReturn = returnTo;
    picker.start();
  }

  /* ---- keyboard ---------------------------------------------------------------------- */

  function onKey(event) {
    if (event.shiftKey && event.altKey && !event.ctrlKey && !event.metaKey) {
      if (event.code === SHORTCUTS.open) {
        event.preventDefault();
        if (picker.picking) picker.stop();
        if (state.open) setOpen(false);
        else {
          if (state.screen !== "home") navigate("home");
          setOpen(true);
        }
        return;
      }
      if (event.code === SHORTCUTS.pick) {
        event.preventDefault();
        if (picker.picking) picker.stop();
        else startPicking();
        return;
      }
    }
    if (event.key === "Escape") {
      if (picker.picking) {
        event.preventDefault();
        picker.stop();
      } else if (state.open && event.composedPath?.().includes(host)) {
        event.preventDefault();
        setOpen(false);
      }
    }
  }
  listen(document, "keydown", onKey, true);

  /* ---- the page --------------------------------------------------------------------- */

  let scanTimer = null;
  function scan() {
    state.instances = scanPage(document, host);
    refresh("page");
  }
  const scheduleScan = () => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, SCAN_DEBOUNCE_MS);
  };
  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver((records) => {
      if (records.every((r) => r.target === host || host.contains(r.target))) return;
      scheduleScan();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-astralis", "data-astralis-props"] });
    cleanups.push(() => observer.disconnect());
  }
  cleanups.push(() => clearTimeout(scanTimer));

  listen(window, "scroll", () => picker.refresh(), true);
  listen(window, "resize", () => {
    launcher.layout();
    if (state.open) placePanel();
    picker.refresh();
  });
  cleanups.push(() => picker.stop());

  /* ---- the bridge ------------------------------------------------------------------ */

  const getJson = (path) => fetch(`${base}/${path}`, { cache: "no-store" }).then((response) => (response.ok ? response.json() : null));

  getJson("spec")
    .then((spec) => {
      if (spec?.components) {
        state.spec = spec;
        refresh("spec");
      }
    })
    .catch(() => {});
  getJson("info")
    .then((info) => {
      if (info && !info.problem) {
        state.info = info;
        refresh("info");
      }
    })
    .catch(() => {});

  if (typeof EventSource !== "undefined") {
    const events = new EventSource(`${base}/events`);
    events.addEventListener("findings", (event) => {
      try {
        state.findings = JSON.parse(event.data);
        state.bridge = "live";
        refresh("findings");
      } catch {
        // a malformed event changes nothing
      }
    });
    events.addEventListener("error", () => {
      state.bridge = "unreachable";
      refresh("bridge");
    });
    cleanups.push(() => events.close());
  }

  function loadRouteFiles() {
    if (framework !== "next") return;
    getJson(`route-files?path=${encodeURIComponent(state.route)}`)
      .then((result) => {
        if (result?.path === state.route) {
          state.routeFiles = result.files ?? [];
          refresh("route");
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
      loadRouteFiles();
      scan();
    }
  }, ROUTE_POLL_MS);
  cleanups.push(() => clearInterval(routePoll));

  state.instances = scanPage(document, host);
  navigate(state.screen);
  if (remembered.open) setOpen(true);

  return () => {
    current?.dispose?.();
    for (const cleanup of cleanups.splice(0)) cleanup();
    host.remove();
    if (ownFonts) fonts.remove();
  };
}
