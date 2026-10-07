import { h, icon } from "../dom.mjs";
import { readIdentity } from "../identity.mjs";
import { ICONS } from "../icons.mjs";
import { browserEnvironment, captureScreenshot, treeFromElement } from "../report.mjs";
import { empty } from "./shared.mjs";

/* Report: an issue snapshot of one component and everything inside it. The
   exact JSON is shown before anything is sent, and nothing is sent until the
   reporter presses Send. The form keeps its input across screens and while
   findings stream in. */

export function reportScreen(app) {
  const { state } = app;
  const r = state.report;
  const element = state.selected?.isConnected ? state.selected : null;

  if (!element) {
    const root = h(
      "div",
      {},
      empty(ICONS.report, "Which component is it?", "Pick the component the problem is in. The report describes it and everything inside it.", { neutral: true }),
      h(
        "div",
        { class: "row", style: "justify-content:center" },
        h("button", { class: "btn primary", type: "button", onclick: () => app.startPicking("report") }, icon(ICONS.pick), "Pick a component"),
        h("button", { class: "btn", type: "button", onclick: () => app.navigate("components") }, "Choose from the list"),
      ),
    );
    return { title: [{ label: "Report" }], root, update() {} };
  }

  let timer = null;
  let request = 0;

  /** The JSON as shown: exact, except that a screenshot's data is summarised (it is shown as an image). */
  function previewText(snapshot) {
    const shown = snapshot.screenshot
      ? { ...snapshot, screenshot: `data:image/jpeg;base64,… (${Math.round((snapshot.screenshot.length * 0.75) / 1024)} kB, shown above)` }
      : snapshot;
    return JSON.stringify(shown, null, 2);
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(assemble, 250);
  }

  /** Ask the bridge to complete the snapshot from the page's part. Nothing leaves the machine. */
  async function assemble() {
    if (!element.isConnected) return;
    const mine = ++request;
    const body = {
      tree: treeFromElement(element, state.spec, { includeText: r.includeText, skip: app.host }),
      route: location.pathname,
      environment: browserEnvironment(window),
      description: { title: r.title, happened: r.happened, expected: r.expected },
      include: { findings: r.includeFindings, console: r.includeConsole, screenshot: Boolean(r.screenshot) },
      console: [...app.consoleErrors.messages],
      ...(r.screenshot ? { screenshot: r.screenshot } : {}),
    };
    try {
      const response = await fetch(`${app.base}/snapshot`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (mine !== request) return; // a newer edit is on its way
      if (!response.ok) throw new Error(result?.error ?? `The bridge answered ${response.status}.`);
      r.snapshot = result.snapshot;
      r.problems = result.problems;
      if (r.status === "notice") r.status = "idle";
    } catch (error) {
      if (mine !== request) return;
      r.snapshot = null;
      r.problems = [error.message];
    }
    refresh();
  }

  async function send() {
    if (!r.snapshot || r.problems.length) return;
    r.status = "sending";
    r.message = "";
    refresh();
    try {
      const response = await fetch(`${app.base}/submit`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(r.snapshot) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? `The bridge answered ${response.status}.`);
      r.status = "sent";
      r.url = result.url;
      window.open(result.url, "_blank", "noopener");
    } catch (error) {
      r.status = "failed";
      r.message = error.message;
    }
    refresh();
  }

  function notice(message) {
    r.status = "notice";
    r.message = message;
    refresh();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(r.snapshot, null, 2));
      notice("Copied the snapshot's JSON.");
    } catch {
      notice("The browser did not allow copying; use Download instead.");
    }
  }

  function download() {
    const blob = new Blob([`${JSON.stringify(r.snapshot, null, 2)}\n`], { type: "application/json" });
    const link = h("a", { href: URL.createObjectURL(blob), download: "astralis-snapshot.json" });
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    notice("Saved astralis-snapshot.json.");
  }

  async function addScreenshot() {
    try {
      r.screenshot = await captureScreenshot({
        hide: () => (app.host.style.visibility = "hidden"),
        show: () => (app.host.style.visibility = ""),
      });
      schedule();
    } catch (error) {
      notice(error?.name === "NotAllowedError" ? "No screenshot: the capture was declined." : `No screenshot: ${error.message}`);
    }
    refresh();
  }

  const field = (label, key, multiline, placeholder) => {
    const input = h(multiline ? "textarea" : "input", { class: "field", rows: multiline ? 3 : null, maxlength: multiline ? 4000 : 200, "aria-label": label, placeholder });
    input.value = r[key];
    input.addEventListener("input", () => {
      r[key] = input.value;
      schedule();
    });
    return h("label", { class: "field-label" }, label, input);
  };
  const toggle = (label, key, hint) => {
    const box = h("input", { type: "checkbox" });
    box.checked = r[key];
    box.addEventListener("change", () => {
      r[key] = box.checked;
      schedule();
    });
    const text = h("span", {}, label);
    return { row: h("label", { class: "switch-row toggle" }, h("span", {}, text, h("small", {}, hint)), h("span", { class: "switch" }, box, h("span"))), text };
  };

  const textToggle = toggle("Include page text", "includeText", "Off: text is replaced by its length.");
  const findingsToggle = toggle("Include the validator's findings", "includeFindings", "For the files that render this page.");
  const consoleToggle = toggle("Include console errors", "includeConsole", "Paths are trimmed to the app.");
  const shot = h("div", { class: "shot" });
  const preview = h("pre", { class: "json", "aria-label": "Snapshot JSON" });
  const problems = h("ul", { class: "problems" });
  const status = h("p", { class: "report-status" });
  const sendButton = h("button", { class: "btn primary", type: "button", onclick: send }, icon(ICONS.send), h("span", {}, "Send report"));
  const copyButton = h("button", { class: "btn", type: "button", onclick: copy }, icon(ICONS.copy), "Copy JSON");
  const downloadButton = h("button", { class: "btn", type: "button", onclick: download }, icon(ICONS.download), "Download");

  const root = h(
    "div",
    { class: "report stack" },
    h(
      "div",
      { class: "card target" },
      h("span", { class: "detail-icon" }, icon(ICONS.components)),
      h("div", { class: "grow" }, h("div", { class: "name" }, readIdentity(element)[0]?.name ?? "Component"), h("div", { class: "muted", style: "font-size:12px" }, "and everything inside it. Nothing is sent until you press Send.")),
      h("button", { class: "btn ghost", type: "button", onclick: () => app.startPicking("report") }, icon(ICONS.pick), "Change"),
    ),
    field("Title", "title", false, "Card loses its border in dark mode"),
    field("What happened?", "happened", true, "What you saw"),
    field("What did you expect?", "expected", true, "What should have happened"),
    h("div", { class: "card", style: "padding:2px 14px" }, textToggle.row, findingsToggle.row, consoleToggle.row, h("div", { class: "switch-row", style: "cursor:default" }, h("span", {}, "Screenshot", h("small", {}, "Captured only when you ask.")), shot)),
    problems,
    h("details", { class: "json-box" }, h("summary", {}, icon(ICONS.chevron), "Exactly what will be sent"), preview),
    h("div", { class: "row" }, sendButton, copyButton, downloadButton),
    status,
  );

  function refresh() {
    consoleToggle.text.textContent = `Include console errors (${app.consoleErrors.messages.length})`;
    shot.replaceChildren(
      r.screenshot
        ? h(
            "div",
            { class: "row" },
            h("img", { class: "thumb", src: r.screenshot, alt: "Screenshot to be sent" }),
            h("button", { class: "btn ghost", type: "button", onclick: () => { r.screenshot = null; schedule(); refresh(); } }, "Remove"),
          )
        : h("button", { class: "btn", type: "button", onclick: addScreenshot }, icon(ICONS.camera), "Add…"),
    );
    preview.textContent = r.snapshot ? previewText(r.snapshot) : "Assembling…";
    problems.replaceChildren(...r.problems.map((p) => h("li", {}, p)));
    sendButton.disabled = !r.snapshot || r.problems.length > 0 || r.status === "sending";
    copyButton.disabled = !r.snapshot;
    downloadButton.disabled = !r.snapshot;
    sendButton.lastChild.textContent = r.status === "sending" ? "Sending…" : "Send report";
    status.className = `report-status ${r.status}`;
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

  refresh();
  schedule();
  return {
    title: [{ label: "Report" }],
    root,
    // Current findings, not the ones from when the form was opened.
    update(reason) {
      refresh();
      if (reason === "findings") schedule();
    },
    dispose: () => clearTimeout(timer),
  };
}
