import { h, icon, plural } from "../dom.mjs";
import { readIdentity } from "../identity.mjs";
import { GITHUB_MARK, ICONS } from "../icons.mjs";
import { browserEnvironment, captureScreenshot, treeFromElement } from "../report.mjs";
import { empty } from "./shared.mjs";

/* Report: a problem sent to the maintainers as a GitHub issue, opened from
   the reporter's own account, and the issues they have opened so far.

   A report is an issue snapshot of one component and everything inside it.
   The exact JSON is shown before anything is sent, and nothing is sent until
   the reporter presses Send. The form keeps its input across screens and
   while findings stream in. */

/** The form for a new report. */
function newReport(app) {
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
    return { root, update() {} };
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
      checkSimilar(result.snapshot);
    } catch (error) {
      if (mine !== request) return;
      r.snapshot = null;
      r.problems = [error.message];
    }
    refresh();
  }

  /** Issues that may already report this. The bridge searches GitHub once per problem, not per keystroke. */
  async function checkSimilar(snapshot) {
    if (!app.state.github?.login) return;
    try {
      const response = await fetch(`${app.base}/github/similar`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(snapshot) });
      if (!response.ok) return;
      r.similar = await response.json();
    } catch {
      return; // no check is no reason to stop a report
    }
    refresh();
  }

  /** Open a new issue, or, with `addTo`, add the report to that existing one. */
  async function send(addTo = null) {
    if (!r.snapshot || r.problems.length) return;
    r.status = "sending";
    r.message = "";
    refresh();
    try {
      const where = addTo ? `submit?addTo=${addTo}` : "submit";
      const response = await fetch(`${app.base}/${where}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(r.snapshot) });
      const result = await response.json();
      if (response.status === 401) app.github.reload();
      if (!response.ok) throw new Error(result?.error ?? `The bridge answered ${response.status}.`);
      r.status = "sent";
      r.url = result.url;
      r.number = result.number;
      r.added = Boolean(addTo);
      r.similar = null;
      window.open(result.url, "_blank", "noopener");
      app.github.loadIssues();
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

  /** Open GitHub's own form, filled in, to submit there: no sign-in. The page asks the bridge to build the link. */
  async function openOnGitHub() {
    try {
      const response = await fetch(`${app.base}/github/link`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(r.snapshot) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? `The bridge answered ${response.status}.`);
      window.open(result.url, "_blank", "noopener");
      notice(
        r.screenshot
          ? "GitHub's form is open in a new tab: check it, drop the screenshot in, and press Create."
          : "GitHub's form is open in a new tab: check it and press Create.",
      );
    } catch (error) {
      notice(`${error.message} Copy JSON or Download keeps the snapshot.`);
    }
  }

  /** GitHub's API cannot attach images, so a screenshot is saved for the reporter to drop into the issue. */
  function downloadScreenshot() {
    h("a", { href: r.screenshot, download: "astralis-screenshot.jpg" }).click();
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
  const similar = h("div", {});
  const sendButton = h("button", { class: "btn primary", type: "button", onclick: () => send() }, icon(GITHUB_MARK), h("span", {}, "Open issue on GitHub"));
  const linkButton = h("button", { class: "btn", type: "button", title: "Opens GitHub's own form, filled in; you submit it there. No sign-in.", onclick: openOnGitHub }, icon(ICONS.external), "Open on GitHub instead");
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
    h("div", { class: "card", style: "padding:2px 14px" }, textToggle.row, findingsToggle.row, consoleToggle.row, h("div", { class: "switch-row", style: "cursor:default" }, h("span", {}, "Screenshot", h("small", {}, "Captured only when you ask. You add it to the issue yourself.")), shot)),
    problems,
    similar,
    h("details", { class: "json-box" }, h("summary", {}, icon(ICONS.chevron), "Exactly what will be sent"), preview),
    h("div", { class: "row" }, sendButton, linkButton, copyButton, downloadButton),
    status,
  );

  /** The issues that may already report this, with a way to add to one instead of opening another. */
  function similarCard() {
    const found = r.similar;
    if (!found || (!found.duplicates.length && !found.related.length)) return null;
    const row = (issue, canAdd) =>
      h(
        "div",
        { class: "similar-row" },
        icon(issue.state === "closed" ? ICONS.issueClosed : ICONS.issueOpen, `icon state ${issue.state}`),
        h(
          "a",
          { class: "grow similar-title", href: issue.url, target: "_blank", rel: "noreferrer" },
          h("span", { class: "faint" }, `#${issue.number} `),
          issue.title,
        ),
        canAdd
          ? h("button", { class: "btn", type: "button", disabled: !r.snapshot || r.problems.length > 0 || r.status === "sending", onclick: () => send(issue.number) }, "Add my report here")
          : null,
      );
    return h(
      "div",
      { class: `card similar${found.duplicates.length ? " likely" : ""}` },
      found.duplicates.length
        ? [
            h("div", { class: "similar-head" }, icon(ICONS.copy), "This may already be reported"),
            h("p", { class: "muted small" }, "Same component, same rule codes, same astralis-ui version. Adding your report to it tells the maintainers it happens to more people."),
            found.duplicates.slice(0, 3).map((issue) => row(issue, true)),
          ]
        : null,
      found.related.length
        ? [
            h("div", { class: "similar-head quiet" }, `Open issues about ${r.snapshot?.tree?.[0]?.component ?? "this component"}`),
            found.related.map((issue) => row(issue, false)),
          ]
        : null,
    );
  }

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
    const signedIn = Boolean(app.state.github?.login);
    sendButton.disabled = !signedIn || !r.snapshot || r.problems.length > 0 || r.status === "sending";
    sendButton.title = signedIn ? "" : "Sign in with GitHub first";
    linkButton.disabled = !r.snapshot || r.problems.length > 0;
    copyButton.disabled = !r.snapshot;
    downloadButton.disabled = !r.snapshot;
    sendButton.lastChild.textContent = r.status === "sending" ? "Opening…" : "Open issue on GitHub";
    similar.replaceChildren(similarCard());
    status.className = `report-status ${r.status}`;
    status.replaceChildren(
      r.status === "sent"
        ? h(
            "span",
            {},
            r.added ? `Added your report to #${r.number}. ` : `Opened #${r.number} on GitHub. `,
            h("a", { class: "link", href: r.url, target: "_blank", rel: "noreferrer" }, "View it"),
            r.screenshot
              ? h("span", {}, ". GitHub cannot take images by API: ", h("button", { class: "link", type: "button", onclick: downloadScreenshot }, "save the screenshot"), " and drop it into the issue.")
              : ".",
          )
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
    root,
    // Current findings, not the ones from when the form was opened.
    update(reason) {
      refresh();
      if (reason === "findings") schedule();
    },
    dispose: () => clearTimeout(timer),
  };
}

/** Who is signed in to GitHub, or how to sign in. */
function accountCard(app) {
  const gh = app.state.github;
  const repo = gh?.repo ?? "sekiro-9/astralis-ui";
  if (!gh) return h("div", { class: "card account" }, h("div", { class: "skeleton", style: "width:50%" }));
  if (!gh.configured) {
    return h(
      "div",
      { class: "notice" },
      "GitHub sign-in is not set up in this version of the DevTools. Use Open on GitHub instead below: it fills in GitHub's own form, and you submit it there.",
    );
  }
  if (gh.login) {
    return h(
      "div",
      { class: "card account" },
      h("span", { class: "gh-avatar" }, gh.login[0].toUpperCase()),
      h("div", { class: "grow" }, h("div", { class: "account-name" }, gh.login), h("div", { class: "muted small" }, `Reports open issues on ${repo} as you.`)),
      h("button", { class: "btn ghost", type: "button", onclick: () => app.github.signOut() }, icon(ICONS.signOut), "Sign out"),
    );
  }
  if (gh.pending) {
    const copied = h("span", {}, "Copy code");
    return h(
      "div",
      { class: "card account pending" },
      h(
        "div",
        { class: "grow" },
        h("div", { class: "muted small" }, "Enter this code on GitHub"),
        h("div", { class: "device-code", "aria-label": "Sign-in code" }, gh.pending.userCode),
        h("div", { class: "row waiting" }, h("span", { class: "spinner" }), "Waiting for you to enter it…"),
      ),
      h(
        "div",
        { class: "account-actions" },
        h("a", { class: "btn primary", href: gh.pending.verificationUri, target: "_blank", rel: "noreferrer" }, icon(GITHUB_MARK), "Open GitHub"),
        h(
          "button",
          {
            class: "btn",
            type: "button",
            onclick: async () => {
              try {
                await navigator.clipboard.writeText(gh.pending.userCode);
                copied.textContent = "Copied";
              } catch {
                copied.textContent = "Copy it by hand";
              }
            },
          },
          icon(ICONS.copy),
          copied,
        ),
        h("button", { class: "btn ghost", type: "button", onclick: () => app.github.signOut() }, "Cancel"),
      ),
    );
  }
  return h(
    "div",
    { class: "card account" },
    h("span", { class: "gh-avatar muted-avatar" }, icon(GITHUB_MARK)),
    h(
      "div",
      { class: "grow" },
      h("div", { class: "account-name" }, "Sign in to report"),
      h("div", { class: "muted small" }, `Issues open on ${repo} from your own account. The app can only read and write issues there. Or use Open on GitHub instead, with no sign-in.`),
      gh.error ? h("div", { class: "account-error" }, gh.error) : null,
    ),
    h("button", { class: "btn primary", type: "button", onclick: () => app.github.signIn() }, icon(GITHUB_MARK), "Sign in with GitHub"),
  );
}

const ago = (iso) => {
  const seconds = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  const units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of units) if (seconds >= size) return `${plural(Math.floor(seconds / size), unit)} ago`;
  return "just now";
};

/** The issues the reporter has opened, and where each stands. */
function yourIssues(app) {
  const root = h("div", {});
  function update() {
    const gh = app.state.github;
    const issues = app.state.issues;
    if (!gh?.login) {
      root.replaceChildren(empty(ICONS.report, "Your issues show here", "Sign in with GitHub to see the issues you have opened and where each stands.", { neutral: true }));
      return;
    }
    const list = issues.list;
    const head = h(
      "div",
      { class: "row", style: "margin-bottom:10px" },
      h("span", { class: "muted grow small" }, list ? `${list.filter((i) => i.state === "open").length} open, ${list.filter((i) => i.state === "closed").length} closed` : ""),
      h(
        "button",
        { class: "icon-button", type: "button", "aria-label": "Refresh", title: "Refresh", onclick: () => app.github.loadIssues() },
        icon(ICONS.refresh, `icon${issues.loading ? " spinning" : ""}`),
      ),
    );
    if (issues.error) return root.replaceChildren(head, h("div", { class: "notice" }, issues.error));
    if (!list) return root.replaceChildren(head, h("div", { class: "stack" }, h("div", { class: "skeleton" }), h("div", { class: "skeleton", style: "width:70%" })));
    if (!list.length) return root.replaceChildren(head, empty(ICONS.check, "No issues yet", "Reports you send open here, with their status as the maintainers work on them."));
    root.replaceChildren(
      head,
      h(
        "div",
        { class: "file-card issue-list" },
        list.map((issue) => {
          const closed = issue.state === "closed";
          const skipped = closed && issue.stateReason === "not_planned";
          const status = closed ? (skipped ? "Closed, not planned" : "Closed, done") : "Open";
          return h(
            "a",
            { class: `issue-row ${closed ? (skipped ? "skipped" : "done") : "open"}`, href: issue.url, target: "_blank", rel: "noreferrer" },
            icon(closed ? ICONS.issueClosed : ICONS.issueOpen, "icon state"),
            h(
              "div",
              { class: "grow" },
              h("div", { class: "issue-title" }, issue.title),
              h("div", { class: "issue-meta" }, `#${issue.number} · ${status} · updated ${ago(issue.updatedAt)}`, issue.comments ? ` · ${plural(issue.comments, "comment")}` : ""),
              issue.labels.length ? h("div", { class: "tags", style: "margin-top:6px" }, issue.labels.map((label) => h("span", { class: "pill" }, label))) : null,
            ),
            icon(ICONS.external, "icon go"),
          );
        }),
      ),
    );
  }
  update();
  return { root, update };
}

export function reportScreen(app) {
  const { state } = app;
  const account = h("div", {});
  const tabs = h("div", { class: "segmented", role: "tablist", style: "margin:0 0 14px" });
  const body = h("div", {});
  let view = null;

  function drawTabs() {
    const count = state.issues.list?.length;
    const tab = (id, label) =>
      h("button", { type: "button", role: "tab", "data-tab": id, "aria-selected": String(state.reportTab === id), "aria-pressed": String(state.reportTab === id), onclick: () => show(id) }, label);
    tabs.replaceChildren(tab("new", "New report"), tab("issues", count ? `Your issues (${count})` : "Your issues"));
  }

  function show(tab) {
    state.reportTab = tab;
    view?.dispose?.();
    view = tab === "issues" ? yourIssues(app) : newReport(app);
    body.replaceChildren(view.root);
    drawTabs();
    if (tab === "issues" && state.github?.login && !state.issues.list && !state.issues.loading) app.github.loadIssues();
  }

  const root = h("div", { class: "stack" }, account, h("div", {}, tabs, body));
  account.replaceChildren(accountCard(app));
  show(state.reportTab ?? "new");
  return {
    title: [{ label: "Report" }],
    root,
    update(reason) {
      if (reason === "github") {
        account.replaceChildren(accountCard(app));
        drawTabs();
      }
      view.update(reason);
    },
    dispose: () => view?.dispose?.(),
  };
}
